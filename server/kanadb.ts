import mysql2, { ResultSetHeader, Query } from 'mysql2'
import { SQL, SQLStatement } from 'sql-template-strings'

export type KanaPlayerStats = {
  id: number
  steamID: string
  matchID: number
  Team: number
  Kills: number
  Deaths: number
  Assists: number
  MVPs: number
  totalDamage: number
  headshots: number
  flashAssists: number
  ADR: number
  hsPercent: number
  Plants: number
  Explodes: number
  Defuses: number
  firstKills: number
  Kills1: number
  Kills2: number
  Kills3: number
  Kills4: number
  Kills5: number
  Trades: number
  Traded: number
  clutchesWon: number
  AWPKills: number
  utilityDamage: number
  KillsThroughWalls: number
  flashesThrown: number
  enemiesFlashed: number
  matesFlashed: number
  selfFlashes: number
  firstDeaths: number
  totalMFDuration: string
  totalEFDuration: string
  oneVoneWon: number
  oneVoneLost: number
  KAST: number
  kanaRating: string
  firstKills_T: number
  firstKills_CT: number
  firstDeaths_T: number
  firstDeaths_CT: number
  FirstDeath_Trades: number
  FirstDeath_Traded: number
  FirstDeath_Trades_CT: number
  FirstDeath_Traded_CT: number
  FirstDeath_Trades_T: number
  FirstDeath_Traded_T: number
  flashesThrown_T: number
  flashesThrown_CT: number
  enemiesFlashed_T: number
  enemiesFlashed_CT: number
  Kills_T: number
  Kills_CT: number
  Deaths_T: number
  Deaths_CT: number
  Trades_T: number
  Trades_CT: number
  Traded_T: number
  Traded_CT: number
  totalEFDuration_CT: number
  totalEFDuration_T: number
  totalMFDuration_T: number
  totalMFDuration_CT: number
  matesFlashed_T: number
  matesFlashed_CT: number
  ttd: number
  CrosshairPlacement: string
  ttf: number
  RWS: number
  totalStrafingShots: number | null
  goodStrafingShots: number | null
}

let _connection: mysql2.Connection | null = null
const getConnection = async (): Promise<mysql2.Connection> => {
  if (_connection) return _connection

  _connection = mysql2.createConnection({
    host: process.env.KANA_DB_HOST,
    user: process.env.KANA_DB_USERNAME,
    password: process.env.KANA_DB_PASSWORD,
    database: process.env.KANA_DB_DATABASE,
  })

  return _connection
}

const query = async <T>(query: SQLStatement) => {
  const connection = await getConnection()
  return new Promise<T[]>((resolve, reject) =>
    connection.query(query, (err, res) => {
      if (err) {
        reject(err)
        return
      }

      resolve(res as T[])
    })
  )
}

export const getSeasons = () =>
  query<{ season: number }>(SQL`
    SELECT DISTINCT season FROM leagues
  `).then((seasons) => seasons.map(({ season }) => season))

export const getSeason8StatsForPlayer = (steamId: string) =>
  query<KanaPlayerStats>(SQL`
    SELECT * FROM playerStats_s8 WHERE steamID = ${steamId}
  `)
export const getSeason7StatsForPlayer = (steamId: string) =>
  query<KanaPlayerStats>(SQL`
      SELECT * FROM playerStats_s7 WHERE steamID = ${steamId}
    `)

export const getPlayersForTeam = (teamId: number) =>
  query<{
    steamId: string
    name: string
    teamId: number
  }>(SQL`
    SELECT steamID AS steamId, name, teamId FROM players WHERE teamId = ${teamId}
  `)

export const getSeason9Teams = () =>
  query<{ id: number; name: string; division: string }>(SQL`
    SELECT teamsbuild_s9.id, teamsbuild_s9.name, leagues.name AS division
    FROM teamsbuild_s9, leagues
    WHERE
      leagues.id = teamsbuild_s9.leagueID
  `)
