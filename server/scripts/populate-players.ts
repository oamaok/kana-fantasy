import fetch from 'node-fetch'
import dotenv from 'dotenv'
import * as db from '../database'
import * as kanadb from '../kanadb'
import data from '../../scraped-data.json'
import SQL from 'sql-template-strings'
import { string } from 'fp-ts'

dotenv.config()

const main = async () => {
  const teams = await kanadb.getSeason9Teams()

  const players = (
    await Promise.all(teams.map((team) => kanadb.getPlayersForTeam(team.id)))
  ).flat()

  const playerStats: Record<string, kanadb.KanaPlayerStats[]> = {}

  let i = 0

  await Promise.all(
    players.map(async (player) => {
      playerStats[player.steamId] = (
        await Promise.all([
          kanadb.getSeason8StatsForPlayer(player.steamId),
          kanadb.getSeason7StatsForPlayer(player.steamId),
        ])
      ).flat()

      console.log('Reading player stats', (++i / players.length) * 100)
    })
  )

  const allStats = Object.values(playerStats).flat()

  const averageRating =
    allStats.reduce((sum, match) => parseFloat(match.kanaRating) + sum, 0) /
    allStats.length
  const inverseRating = 1 / averageRating

  const playerRecords: Record<
    string,
    {
      steamId: string
      name: string
      teamId: number
      price: number
      season: number
      division: string
      avatar: string
    }
  > = {}

  for (const player of players) {
    const stats = playerStats[player.steamId]

    const rating =
      stats.reduce((acc, match) => acc + parseFloat(match.kanaRating), 0) /
      stats.length
    const price =
      stats.length === 0
        ? 200000
        : Math.round((rating * inverseRating * 0.5 + 0.5) * 2000) * 100

    const team = teams.find((t) => t.id === player.teamId)!

    playerRecords[player.steamId] = {
      steamId: player.steamId,
      name: player.name,
      teamId: team.id,
      price,
      season: 9,
      division: team.division,
      avatar: '',
    }
  }

  const values = Object.values(playerRecords)

  const batchSize = 20
  for (i = 0; i < values.length; i += batchSize) {
    const { response } = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${
        process.env.STEAM_API_KEY
      }&steamids=${values
        .slice(i, i + 20)
        .map((q) => q.steamId)
        .join(',')}`
    ).then((res: any) => res.json())

    for (const p of response.players) {
      playerRecords[p.steamid].avatar = p.avatarfull
    }

    console.log('avatar fetch', (i / values.length) * 100)
  }

  for (const team of teams) {
    await db.query(SQL`
      INSERT INTO team (id, name, logo)
      VALUES (${team.id}, ${
      team.name
    }, ${`https://stats.kanaliiga.fi/img/S9_${team.id}.png`})
    `)
  }

  const [season] = await db.saveSeasons([
    {
      id: null,
      name: 'S9',
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      lockDate: new Date().toISOString(),
    },
  ])

  i = 0
  const records = Object.values(playerRecords)
  for (const record of records) {
    await db.query(SQL`
    
    INSERT INTO
      "player" ("steamId", "username", "avatar", "teamId", "price", "seasonId", "division")
    VALUES (
      ${record.steamId},
      ${record.name},
      ${record.avatar},
      ${record.teamId},
      ${record.price},
      ${season.id},
      ${record.division}
    )
    `)

    console.log('insert', (++i / records.length) * 100)
  }

  return
}

main()
