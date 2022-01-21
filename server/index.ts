import dotenv from 'dotenv'
import 'reflect-metadata'

import Koa, { ParameterizedContext, Next } from 'koa'
import Router from 'koa-router'
import serve from 'koa-static'
import mount from 'koa-mount'
import bodyparser from 'koa-bodyparser'
import OAuth from 'discord-oauth2'
import fs from 'fs'
import { initializeConnection } from './connection'
import * as t from 'io-ts'
import * as jwt from './jwt'

import User from './models/User'
import PlayerRole from './models/PlayerRole'
import * as validators from '../common/validators'
import Player from './models/Player'
import Team from './models/Team'

dotenv.config()

const DISCORD_OAUTH2_TOKEN_REVOKE_CREDENTIALS = Buffer.from(
  `${process.env.DISCORD_OAUTH2_CLIENT_ID}:${process.env.DISCORD_OAUTH2_CLIENT_SECRET}`
).toString('base64')

const oauth = new OAuth({
  clientId: process.env.DISCORD_OAUTH2_CLIENT_ID,
  clientSecret: process.env.DISCORD_OAUTH2_CLIENT_SECRET,
  redirectUri: 'http://localhost:8080',
})

const app = new Koa()
const apiRouter = new Router()

const validateBody =
  <Decoder extends t.TypeC<any>>(
    decoder: Decoder,
    callback: (
      ctx: Omit<ParameterizedContext, 'request'> & {
        request: Omit<ParameterizedContext['request'], 'body'> & {
          body: t.TypeOf<Decoder>
        }
      },
      next: Next
    ) => void
  ) =>
  async (ctx: ParameterizedContext, next: Next) => {
    const result = decoder.decode(ctx.request.body)

    if (result._tag === 'Left') {
      ctx.status = 400
      console.error(result.left)
      ctx.body = { error: 'invalid request' }
    } else {
      try {
        await callback(ctx as any, next)
      } catch (err) {
        console.error(err)
        ctx.status = 500
        ctx.body = { error: 'server error' }
      }
    }
  }

const getAccessToken = (ctx: ParameterizedContext) => {
  return jwt.verify(ctx.headers.authorization ?? '')?.accessToken
}

const requireAuth = (ctx: ParameterizedContext, next: Next) => {
  const user = jwt.verify(ctx.headers.authorization ?? '')
  if (!user) {
    ctx.status = 401
    ctx.body = { error: 'unauthorized' }
    return
  }
  ctx.user = user
  return next()
}

const requireAdmin = (ctx: ParameterizedContext, next: Next) => {
  const isAdmin = jwt.verify(ctx.headers.authorization ?? '')?.isAdmin
  if (!isAdmin) {
    ctx.status = 401
    ctx.body = { error: 'unauthorized' }
    return
  }
  return next()
}

const unauthorized = (ctx: ParameterizedContext) => {
  ctx.status = 401
  ctx.body = { error: 'unauthorized' }
}

const updateUser = async (discordUser: OAuth.User): Promise<User> => {
  const user = new User()
  user.id = discordUser.id
  user.avatar = discordUser.avatar ?? null
  user.discordName = discordUser.username + '#' + discordUser.discriminator

  await user.save()
  const users = await User.findByIds([discordUser.id])

  return users[0]
}

apiRouter
  .post(
    '/auth/request',
    validateBody(validators.AuthRequest, async (ctx) => {
      const { access_token, refresh_token } = await oauth.tokenRequest({
        code: ctx.request.body.code,
        scope: 'identify',
        grantType: 'authorization_code',
        redirectUri: 'http://localhost:8080/oauth',
      })

      const discordUser = await oauth.getUser(access_token)
      const user = await updateUser(discordUser)

      ctx.body = {
        token: jwt.sign({
          id: user.id,
          isAdmin: user.isAdmin,
          accessToken: access_token,
          refreshToken: refresh_token,
        }),
        user,
      }
    })
  )
  .get('/auth/verify', async (ctx) => {
    const accessToken = getAccessToken(ctx)

    if (!accessToken) {
      unauthorized(ctx)
      return
    }

    try {
      const discordUser = await oauth.getUser(accessToken)

      const user = await updateUser(discordUser)

      ctx.body = { user }
    } catch (err) {
      unauthorized(ctx)
    }
  })
  .get('/auth/refresh', async (ctx) => {
    const accessToken = getAccessToken(ctx)
    if (!accessToken) {
      unauthorized(ctx)
      return
    }

    const { access_token, refresh_token } = await oauth.tokenRequest({
      code: ctx.request.body.code,
      scope: 'identify',
      grantType: 'refresh_token',
      redirectUri: 'http://localhost:8080/oauth',
    })

    const discordUser = await oauth.getUser(access_token)

    const user = await updateUser(discordUser)

    ctx.body = {
      user,
      token: jwt.sign({
        id: user.id,
        isAdmin: user.isAdmin,
        accessToken: access_token,
        refreshToken: refresh_token,
      }),
    }
  })
  .get('/auth/revoke', async (ctx) => {
    const accessToken = getAccessToken(ctx)
    if (!accessToken) {
      unauthorized(ctx)
      return
    }

    await oauth.revokeToken(
      accessToken,
      DISCORD_OAUTH2_TOKEN_REVOKE_CREDENTIALS
    )
    ctx.body = { status: 'ok' }
  })
  .post('/team',
    requireAuth,
    validateBody(validators.Team, async (ctx) => {
      const teamRecord = ctx.request.body
      const user = await User.findOne({  where: { id: ctx.user.id }})

      const teams = user!.teams ?? []

      const existingTeam = teams.find(team => team.division === teamRecord.division && team.season === teamRecord.season)

      const teamToSave = new Team()
      if (existingTeam) {
        teamToSave.id = existingTeam.id
      }

      teamToSave.name = teamRecord.name
      teamToSave.season = teamRecord.season
      teamToSave.division = teamRecord.division
      teamToSave.players = teamRecord.players
      teamToSave.user = user!

      ctx.body = await teamToSave.save()
    })
  )
  .get('/players/:division', requireAuth, async (ctx) => {
    ctx.body = await Player.find({ where: { division: ctx.params.division } })
  })
  .get('/roles', requireAuth, async (ctx) => {
    ctx.body = await PlayerRole.find({ select: ['id', 'name', 'description'] })
  })
  .get('/full-roles', requireAdmin, async (ctx) => {
    ctx.body = { roles: await PlayerRole.find() }
  })
  .post(
    '/roles',
    requireAdmin,
    validateBody(validators.RoleUpdateRequest, async (ctx) => {
      ctx.body = await Promise.all(
        ctx.request.body.roles.map((role) => {
          const playerRole = new PlayerRole()
          if (role.id !== -1) {
            playerRole.id = role.id
          }

          playerRole.name = role.name
          playerRole.description = role.description
          playerRole.targets = role.targets

          return playerRole.save()
        })
      )
    })
  )

app
  .use(bodyparser())
  .use(mount('/api', apiRouter.middleware()))
  .use(mount('/', serve('./dist')))
  .use((ctx) => {
    ctx.response.set('content-type', 'text/html')
    ctx.body = fs.createReadStream('./dist/index.html')
  })

const init = async () => {
  await initializeConnection()
  app.listen(8080)
  console.log('listening to :8080')
}

init()
