import OAuth from 'discord-oauth2'
import { SQL, SQLStatement } from 'sql-template-strings'
import { Client, Pool, PoolClient, QueryResult as PgQueryResult } from 'pg'
import {
  PlayerRole,
  RoleUpdateRequest,
  SeasonUpdateRequest,
} from '../common/validators'

let _pool: null | Pool = null
export const getConnection = (): Promise<PoolClient> => {
  if (!_pool) {
    _pool = new Pool({
      host: 'localhost',
      user: 'postgres',
      password: 'password',
      port: 5432,
    })
  }

  return _pool.connect()
}

type QueryResult<T> = T[] & {
  rowCount: PgQueryResult['rowCount']
  command: PgQueryResult['command']
  fields: PgQueryResult['fields']
}

export async function query<T = any>(
  statement: SQLStatement
): Promise<QueryResult<T>> {
  const connection = await getConnection()
  const queryResult = await connection.query<T>(statement)

  const res: QueryResult<T> = (queryResult.rows ?? []) as QueryResult<T>
  res.rowCount = queryResult.rowCount
  res.command = queryResult.command
  res.fields = queryResult.fields

  await connection.release()

  return res
}

export const transact = async <T>(fn: (connection: PoolClient) => T) => {
  const connection = await getConnection()
  try {
    await connection.query('BEGIN')
    const result = await fn(connection)
    await connection.query('COMMIT')
    return result
  } catch (err) {
    await connection.query('ROLLBACK')
    throw err
  } finally {
    await connection.release()
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
  return query(SQL`
    SELECT * FROM "player"
    WHERE
      "seasonId" = ${seasonId} AND
      "division" = ${division}
  `)
}

export const getRoles = async () => {
  return query<Omit<PlayerRole, 'targets'>>(SQL`
    SELECT "id", "name", "description" FROM "playerRole"
  `)
}

export const getSeasons = () => {
  return query<{
    id: string
    name: string
    startDate: Date
    endDate: Date
    lockDate: Date
  }>(SQL`SELECT * FROM "season"`)
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
