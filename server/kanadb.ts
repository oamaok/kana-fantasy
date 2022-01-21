import mysql2 from 'mysql2'
import sql from 'sql-template-strings'

let connection: mysql2.Connection | null = null
const getConnection = async (): Promise<mysql2.Connection> => {
  if (connection) return connection

  connection = mysql2.createConnection({
    host: process.env.KANA_DB_HOST,
    user: process.env.KANA_DB_USERNAME,
    password: process.env.KANA_DB_PASSWORD,
    database: process.env.KANA_DB_DATABASE,
  })

  return connection
}
