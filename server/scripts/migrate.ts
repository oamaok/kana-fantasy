import dotenv from 'dotenv'
import fs from 'fs/promises'
import path from 'path'
import SQL from 'sql-template-strings'

import * as db from '../database'

dotenv.config()

const getMigrationVersion = (filename: string) =>
  parseInt(filename.split('-')[0])

const migrate = async () => {
  const client = await db.getClient()
  await client.query(
    SQL`CREATE TABLE IF NOT EXISTS version (version INTEGER PRIMARY KEY DEFAULT 0)`
  )
  const {
    rows: [{ count }],
  } = await client.query<{ count: string }>(
    SQL`SELECT COUNT(*) AS count FROM version`
  )

  if (count === '0') {
    await client.query(SQL`INSERT INTO version (version) VALUES (0)`)
  }
  const {
    rows: [{ version }],
  } = await client.query<{ version: number }>(SQL`SELECT version FROM version`)

  const migrationFiles = await fs.readdir(
    path.resolve(__dirname, '../migrations')
  )

  const applicableMigrations = migrationFiles
    .filter((filename) => getMigrationVersion(filename) > version)
    .sort()

  if (applicableMigrations.length === 0) {
    console.log('No migrations to run.')
    await client.release()
    return
  }

  for (const migration of applicableMigrations) {
    console.log('Running migration ', migration)
    await client.query(SQL`BEGIN`)
    try {
      const {
        default: { up },
      } = require(`../migrations/${migration}`)
      await up(db)
      await client.query(
        SQL`UPDATE version SET version = ${getMigrationVersion(migration)}`
      )
      await client.query(SQL`COMMIT`)
    } catch (err) {
      await client.query(SQL`ROLLBACK`)
      console.error('Failed to run migration ', migration)
      console.error(err)

      await client.release()
      process.exit(1)
      return
    }
  }

  await client.release()
}

export default migrate
