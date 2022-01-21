import fs from 'fs'

import * as api from './csApi'

const seasons = [7, 8]

const divisions: any = {}
const teams: any = {}
const players: any = {}
const matches: any = {}

const main = async () => {
  const { data: divisionData } = await api.getLeagues('8')

  for (const division of divisionData) {
    divisions[division.id] = division
    const { data: teamData } = await api.getTeams(division.id.toString())
    let i = 0
    for (const team of teamData) {
      console.log(`${++i / teamData.length}`)

      teams[team.id] = team
      const { data: playerData } = await api.getPlayers(team.id.toString())

      for (const player of playerData) {
        players[player.steamID] = player
        matches[player.steamID] = await api.getPlayerStats(player.steamID)
      }
    }
  }

  fs.writeFileSync(
    'scraped-data.json',
    JSON.stringify({
      divisions,
      teams,
      players,
      matches,
    })
  )
}

main()
