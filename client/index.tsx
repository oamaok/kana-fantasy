import { h, render } from 'kaiku'
import { getOngoingSeason, state } from './state'
import * as api from './api'
import App from './components/app/App'
import { handleOAuth, inititializeAuth } from './auth'

const initialize = async () => {
  if (state.route?.name === 'oauth-callback') {
    await handleOAuth()
  } else {
    await inititializeAuth()
  }

  if (state.auth.type === 'authenticated') {
    const [seasons, roles, teams] = await Promise.all([
      api.getSeasons(),
      api.getRoles(),
      api.getTeams(),
    ])
    state.seasons = seasons
    state.roles = roles
    state.teams = teams

    const ongoingSeason = getOngoingSeason()

    if (ongoingSeason) {
      state.players = await api.getPlayers(ongoingSeason.id, 'Masters')
    }
  }
}

initialize()

render(<App />, document.getElementById('app')!, state)
