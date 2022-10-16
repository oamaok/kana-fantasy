import OAuth from 'discord-oauth2'
import { SQL, SQLStatement } from 'sql-template-strings'
import {
  Pool,
  PoolClient,
  QueryResult as PgQueryResult,
  QueryResultRow,
} from 'pg'
import {
  PlayerRole,
  RoleDeleteRequest,
  RoleUpdateRequest,
  SeasonUpdateRequest,
  Team,
} from '../common/validators'

let _pool: null | Pool = null
export const getClient = async (): Promise<PoolClient> => {
  if (!_pool) {
    _pool = new Pool({
      host: 'localhost',
      user: 'postgres',
      password: 'password',
      port: 5432,
    })
  }

  for (;;) {
    try {
      const client = await _pool.connect()
      return client
    } catch (err) {
      console.log('Waiting for database...')
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  }
}

type QueryResult<T> = T[] & {
  rowCount: PgQueryResult['rowCount']
  command: PgQueryResult['command']
  fields: PgQueryResult['fields']
}

const createQueryFn =
  (client: PoolClient) =>
  async <T extends QueryResultRow>(
    statement: SQLStatement
  ): Promise<QueryResult<T>> => {
    const queryResult = await client.query<T>(statement)

    const res: QueryResult<T> = (queryResult.rows ?? []) as QueryResult<T>
    res.rowCount = queryResult.rowCount
    res.command = queryResult.command
    res.fields = queryResult.fields

    return res
  }

export async function query<T extends QueryResultRow>(
  statement: SQLStatement
): Promise<QueryResult<T>> {
  const client = await getClient()
  const res = createQueryFn(client)<T>(statement)
  await client.release()
  return res
}

export const transact = async <T>(
  fn: (connection: { query: ReturnType<typeof createQueryFn> }) => T
) => {
  const client = await getClient()
  try {
    await client.query('BEGIN')
    const result = await fn({ query: createQueryFn(client) })
    await client.query('COMMIT')
    return result
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    await client.release()
  }
}

export const findUserById = async (id: string) => {
  const [user] = await query<{
    id: string
    username: string
    isAdmin: boolean
    avatar: string
  }>(SQL`SELECT * FROM "user" WHERE id = ${id}`)

  return user
}

export const upsertUser = async (user: OAuth.User) => {
  await query(SQL`
    INSERT INTO "user" ("id", "username", "avatar")
    VALUES (${user.id}, ${user.username + '#' + user.discriminator}, ${
    user.avatar
  })
    ON CONFLICT ("id") DO UPDATE SET
      "username" = EXCLUDED."username",
      "avatar" = EXCLUDED."avatar" 
  `)

  return findUserById(user.id)
}

export const getPlayers = (seasonId: number, division: string) => {
  return query<{
    steamId: string
    username: string
    avatar: string
    price: number
    seasonId: number
    division: string
    team: string
  }>(SQL`
    SELECT
      "player"."steamId",
      "player"."username",
      "player"."avatar",
      "player"."price",
      "player"."seasonId",
      "player"."division",
      "team"."name" AS "team"
    FROM "player"
    JOIN "team" ON "team"."id" = "player"."teamId"
    WHERE
      "seasonId" = ${seasonId} AND
      "division" = ${division}
  `)
}

export const getDivisions = (seasonId: number) =>
  query<{ division: string }>(
    SQL`SELECT DISTINCT "division" FROM "player" WHERE "seasonId" = ${seasonId}`
  ).then((divisions) => divisions.map(({ division }) => division))

export const getRoles = async () => {
  return query<Omit<PlayerRole, 'targets'>>(SQL`
    SELECT "id", "name", "description" FROM "playerRole"
  `)
}

export const getSeasons = async () => {
  const seasons = await query<{
    id: number
    name: string
    startDate: Date
    endDate: Date
    lockDate: Date
  }>(SQL`SELECT * FROM "season"`)

  return Promise.all(
    seasons.map(async (season) => {
      const divisions = await getDivisions(season.id)

      return {
        ...season,
        divisions,
      }
    })
  )
}

export const saveSeasons = async (seasons: SeasonUpdateRequest) => {
  await Promise.all(
    seasons.map((season) => {
      if (season.id === null) {
        return query(SQL`
        INSERT INTO "season"
          ("name", "startDate", "endDate", "lockDate")
        VALUES 
          (${season.name}, ${season.startDate}, ${season.endDate}, ${season.lockDate})
      `)
      } else {
        return query(SQL`
        UPDATE "season"
        SET
          "name" = ${season.name},
          "startDate" = ${season.startDate},
          "endDate" = ${season.endDate},
          "lockDate" = ${season.lockDate}
        WHERE
          "id" = ${season.id}
      `)
      }
    })
  )

  return getSeasons()
}

export const getRolesWithTargets = () => {
  return query<PlayerRole>(SQL`
    SELECT * FROM "playerRole"
  `)
}

export const saveRoles = async (roles: RoleUpdateRequest) => {
  await Promise.all(
    roles.map((role) => {
      if (role.id === null) {
        return query(SQL`
        INSERT INTO "playerRole"
          ("name", "description", "targets")
        VALUES 
          (${role.name}, ${role.description}, ${JSON.stringify(role.targets)})
      `)
      } else {
        return query(SQL`
        UPDATE "playerRole"
        SET
          "name" = ${role.name},
          "description" = ${role.description},
          "targets" = ${JSON.stringify(role.targets)}
        WHERE
          "id" = ${role.id}
      `)
      }
    })
  )

  return getRolesWithTargets()
}

export const deleteRole = async (role: RoleDeleteRequest) => {
  return await query(SQL`
    DELETE FROM "playerRole"
    WHERE "id" = ${role.id}
  `)
}

export const buyTeam = (userId: string, team: Team) =>
  transact(async ({ query }) => {
    const [{ id }] = await query<{ id: number }>(SQL`
      INSERT INTO "fantasyTeam" ("name", "userId", "seasonId", "division", "bought")
      VALUES (${team.name}, ${userId}, ${team.season}, ${team.division}, true)
      RETURNING "id"
    `)

    for (const player of team.players) {
      await query(SQL`
        INSERT INTO "fantasyTeam_player" ("teamId", "playerId", "roleId", "seasonId")
        VALUES (${id}, ${player.steamId}, ${player.roleId}, ${team.season})        
      `)
    }

    return id
  })

export const getTeams = async (userId: string): Promise<Team[]> => {
  const teams = await query<{
    id: string
    name: string
    bought: boolean
    seasonId: number
    division: string
  }>(SQL`
    SELECT *
    FROM "fantasyTeam"
    WHERE "userId" = ${userId}
  `)

  return Promise.all(
    teams.map(async (team) => {
      const players = await query<{
        steamId: string
        roleId: number | null
      }>(SQL`
      SELECT "playerId" as "steamId", "roleId" FROM "fantasyTeam_player" WHERE "teamId" = ${team.id}
    `)

      return {
        id: team.id,
        name: team.name,
        bought: team.bought,
        season: team.seasonId,
        division: team.division,
        players,
      }
    })
  )
}
