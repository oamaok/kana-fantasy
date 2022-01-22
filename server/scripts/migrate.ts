import dotenv from 'dotenv'
import fs from 'fs/promises'
import path from 'path'
import SQL from 'sql-template-strings'

import * as db from '../database'

dotenv.config()

const getMigrationVersion = (filename: string) =>
  parseInt(filename.split('-')[0])

const migrate = async () => {
  const connection = await db.getConnection()
  await connection.query(
    SQL`CREATE TABLE IF NOT EXISTS version (version INTEGER PRIMARY KEY DEFAULT 0)`
  )
  const {
    rows: [{ count }],
  } = await connection.query<{ count: string }>(
    SQL`SELECT COUNT(*) AS count FROM version`
  )

  if (count === '0') {
    await connection.query(SQL`INSERT INTO version (version) VALUES (0)`)
  }
  const {
    rows: [{ version }],
  } = await connection.query<{ version: number }>(
    SQL`SELECT version FROM version`
  )

  const migrationFiles = await fs.readdir(
    path.resolve(__dirname, '../migrations')
  )

  const applicableMigrations = migrationFiles
    .filter((filename) => getMigrationVersion(filename) > version)
    .sort()

  if (applicableMigrations.length === 0) {
    console.log('No migrations to run.')
    await connection.release()
    return
  }

  for (const migration of applicableMigrations) {
    console.log('Running migration ', migration)
    await connection.query(SQL`BEGIN`)
    try {
      const {
        default: { up },
      } = require(`../migrations/${migration}`)
      await up(db)
      await connection.query(
        SQL`UPDATE version SET version = ${getMigrationVersion(migration)}`
      )
      await connection.query(SQL`COMMIT`)
    } catch (err) {
      await connection.query(SQL`ROLLBACK`)
      console.error('Failed to run migration ', migration)
      console.error(err)

      await connection.release()
      process.exit(1)
      return
    }
  }

  await connection.release()
}

export default migrate
