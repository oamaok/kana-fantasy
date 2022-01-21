import { createState } from 'kaiku'
import { IPlayer } from '../common/interfaces'
import { Team } from '../common/validators'
import { AuthState, getInitialAuthState } from './auth'
import { parseRoute } from './router'
import { translations, Translations, Languages } from './translations'
import * as api from './api'
type State = {
  auth: AuthState
  route: ReturnType<typeof parseRoute>
  language: Languages
  roles: { id: number; name: string; description: string }[]
  division: string
  players: IPlayer[]
  teams: Team[]
}

export const state = createState<State>({
  auth: getInitialAuthState(),
  route: parseRoute(location),
  language: 'en_GB',
  division: 'Masters',
  roles: [],
  players: [],
  teams: [],
})

export const t = (key: keyof Translations[keyof Translations]) => {
  return translations[state.language][key]
}

export const getCurrentTeam = () =>
  state.teams.find((team) => team.division === state.division)

export const getCurrentTeamPlayers = () => {
  const team = getCurrentTeam()
  if (!team) return []

  return team.players
    .map((player) => state.players.find((p) => p.steamId === player.steamId))
    .filter((player): player is IPlayer => !!player)
}

export const addPlayerToCurrentTeam = (player: IPlayer) => {
  const team = getCurrentTeam()
  if (!team) return

  team.players.push({
    steamId: player.steamId,
    role: null,
  })

  api.saveTeam(team)
}

export const removePlayerFromCurrentTeam = (player: IPlayer) => {
  const team = getCurrentTeam()
  if (!team) return

  team.players = team.players.filter((p) => p.steamId !== player.steamId)
}
