import { createState } from 'kaiku'
import { Player } from '../common/types'
import { Team } from '../common/validators'
import { AuthState, getInitialAuthState } from './auth'
import { matchRoute } from './router'
import { translations, Translations, Languages } from './translations'
import * as api from './api'
type State = {
  auth: AuthState
  route: ReturnType<typeof matchRoute>
  language: Languages
  roles: { id: number; name: string; description: string }[]
  division: string
  players: Player[]
  seasons: {
    id: number
    name: string
    startDate: string
    endDate: string
    lockDate: string
  }[]
  teams: null | Team[]
}

export const state = createState<State>({
  auth: getInitialAuthState(),
  route: matchRoute(location),
  language: 'en_GB',
  division: 'Masters',
  roles: [],
  players: [],
  seasons: [],
  teams: null,
})

export const t = (key: keyof Translations[keyof Translations]) => {
  return translations[state.language][key]
}

export const getCurrentTeam = () =>
  state.teams?.find((team) => team.division === state.division)

export const getCurrentTeamPlayers = () => {
  const team = getCurrentTeam()
  if (!team) return []

  return team.players
    .map((player) => state.players.find((p) => p.steamId === player.steamId))
    .filter((player): player is Player => !!player)
}

export const addPlayerToCurrentTeam = (player: Player) => {
  const team = getCurrentTeam()
  if (!team) return

  team.players.push({
    steamId: player.steamId,
    roleId: null,
  })

  api.saveTeam(team)
}

export const removePlayerFromCurrentTeam = (player: Player) => {
  const team = getCurrentTeam()
  if (!team) return

  team.players = team.players.filter((p) => p.steamId !== player.steamId)

  api.saveTeam(team)
}

export const getRemainingBudget = () => {
  const players = getCurrentTeamPlayers()
  return 1000000 - players.reduce((sum, player) => sum + player.price, 0)
}

export const getOngoingSeason = () => {
  const now = new Date()

  return state.seasons.find((season) => {
    return new Date(season.startDate) < now && new Date(season.endDate) > now
  })
}
