import dotenv from 'dotenv'
import 'reflect-metadata'

import Koa, { ParameterizedContext, Next } from 'koa'
import Router from 'koa-router'
import serve from 'koa-static'
import mount from 'koa-mount'
import bodyparser from 'koa-bodyparser'
import OAuth from 'discord-oauth2'
import fs from 'fs'
import * as t from 'io-ts'
import * as jwt from './jwt'
import * as validators from '../common/validators'
import * as db from './database'
import * as csApi from './csApi'

import migrate from './scripts/migrate'
import { JwtData } from './jwt'
dotenv.config()

const DISCORD_OAUTH2_TOKEN_REVOKE_CREDENTIALS = Buffer.from(
  `${process.env.DISCORD_OAUTH2_CLIENT_ID}:${process.env.DISCORD_OAUTH2_CLIENT_SECRET}`
).toString('base64')

const oauth = new OAuth({
  clientId: process.env.DISCORD_OAUTH2_CLIENT_ID,
  clientSecret: process.env.DISCORD_OAUTH2_CLIENT_SECRET,
  redirectUri:
    process.env.DISCORD_OAUTH2_REDIRECT_URI ?? 'http://localhost:8080',
})

type KoaContext = Koa.DefaultContext & { user?: JwtData }
const app = new Koa<Koa.DefaultState, KoaContext>()
const apiRouter = new Router<any, KoaContext>()

const validateBody =
  <Decoder extends t.TypeC<any> | t.ArrayC<any>>(
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
    console.log(ctx.request.body)
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

const requireAuth: Router.IMiddleware<any, KoaContext> = (ctx, next) => {
  const user = jwt.verify(ctx.headers.authorization ?? '')
  if (!user) {
    ctx.status = 401
    ctx.body = { error: 'unauthorized' }
    return
  }
  ctx.user = user
  return next()
}

const requireAdmin: Router.IMiddleware<any, KoaContext> = (ctx, next) => {
  const user = jwt.verify(ctx.headers.authorization ?? '')
  const isAdmin = user?.isAdmin
  if (!isAdmin) {
    ctx.status = 401
    ctx.body = { error: 'unauthorized' }
    return
  }
  ctx.user = user
  return next()
}

const unauthorized = (ctx: ParameterizedContext) => {
  ctx.status = 401
  ctx.body = { error: 'unauthorized' }
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
      const user = await db.upsertUser(discordUser)

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

      const user = await db.upsertUser(discordUser)

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

    const user = await db.upsertUser(discordUser)

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
  .get('/teams', requireAuth, async (ctx) => {
    ctx.body = await db.getTeams(ctx.user!.id)
  })
  .post(
    '/team/buy',
    requireAuth,
    validateBody(validators.Team, async (ctx) => {
      // TODO: Validate price and team limits
      ctx.body = { id: await db.buyTeam(ctx.user.id, ctx.request.body) }
    })
  )
  .get('/seasons', async (ctx) => {
    ctx.body = await db.getSeasons()
  })
  .post(
    '/seasons',
    requireAdmin,
    validateBody(validators.SeasonUpdateRequest, async (ctx) => {
      ctx.body = await db.saveSeasons(ctx.request.body)
    })
  )
  .get('/seasons/:season', () => {})
  .get('/seasons/:season/:division/players', requireAuth, async (ctx) => {
    const players = await db.getPlayers(
      parseInt(ctx.params.season),
      ctx.params.division
    )

    players.sort((a, b) => b.price - a.price)

    ctx.body = players
  })
  .get('/roles', requireAuth, async (ctx) => {
    ctx.body = await db.getRoles()
  })
  .get('/roles/with-targets', requireAdmin, async (ctx) => {
    ctx.body = await db.getRolesWithTargets()
  })
  .post(
    '/roles',
    requireAdmin,
    validateBody(validators.RoleUpdateRequest, async (ctx) => {
      ctx.body = await db.saveRoles(ctx.request.body)
    })
  )
  .delete(
    '/roles',
    requireAdmin,
    validateBody(validators.RoleDeleteRequest, async (ctx) => {
      ctx.body = await db.deleteRole(ctx.request.body)
    })
  )
  .get('/stats/:steamId', requireAuth, async (ctx) => {
    const stats = await csApi.getPlayerStats(ctx.params.steamId)
    const dataPoints = stats.data.length
    const rating = stats.data.reduce(
      (acc, value) => acc + value.kanaRating / dataPoints,
      0
    )
    const hsPercent = stats.data.reduce(
      (acc, value) => acc + value.hsPercent / dataPoints,
      0
    )
    const adr = stats.data.reduce(
      (acc, value) => acc + value.ADR / dataPoints,
      0
    )
    const kills = stats.data.reduce((acc, value) => acc + value.Kills, 0)
    const deaths = stats.data.reduce((acc, value) => acc + value.Deaths, 0) || 1

    ctx.body = {
      rating,
      hsPercent,
      adr,
      kdRatio: kills / deaths,
    }
  })

app
  .use(bodyparser())
  .use(mount('/api', apiRouter.middleware()))
  .use(mount('/', serve('./dist')))
  .use((ctx) => {
    ctx.response.set('content-type', 'text/html')
    ctx.body = fs.createReadStream('./dist/index.html')
  })

const init = async () => {
  await migrate()
  app.listen(8080)
  console.log('listening to :8080')
}

init()
