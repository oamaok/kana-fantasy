import fetch from 'node-fetch'
import dotenv from 'dotenv'
import * as db from '../database'
import data from '../../scraped-data.json'
import SQL from 'sql-template-strings'

dotenv.config()

const main = async () => {
  const players = Object.values(data.players)

  const ratings = []

  const playerRecords = {}
  for (const player of players) {
    const matches = data.matches[player.steamID].data

    if (!matches || !matches.length) continue

    const rating =
      matches.reduce((acc, match) => acc + match.kanaRating, 0) / matches.length
    const price =
      Math.round((rating * 1.1643835616438358 * 0.5 + 0.5) * 2000) * 100

    const team = data.teams[player.teamId]
    const division = data.divisions[team.leagueID].name

    playerRecords[player.steamID] = {
      steamId: player.steamID,
      name: player.name,
      teamName: team.Name,
      price,
      season: 8,
      division,
    }
  }

  const values = Object.values(playerRecords)

  const batchSize = 20
  for (let i = 0; i < values.length; i += batchSize) {
    const { response } = await fetch(
      `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${
        process.env.STEAM_API_KEY
      }&steamids=${values
        .slice(i, i + 20)
        .map((q) => q.steamId)
        .join(',')}`
    ).then((res) => res.json())

    for (const p of response.players) {
      playerRecords[p.steamid].avatar = p.avatarfull
    }

    console.log('avatar', i / values.length)
  }

  let i = 0
  const records = Object.values(playerRecords)
  for (const record of records) {
    await db.query(SQL`
    
    INSERT INTO
      "player" ("steamId", "username", "avatar", "team", "price", "seasonId", "division")
    VALUES
      (${record.steamId}, ${record.name}, ${record.avatar}, ${
      record.teamName
    }, ${record.price}, ${2}, ${record.division})    
    `)

    console.log(++i / records.length)
  }
}

main()
