import { h, render } from 'kaiku'
import { state } from './state'
import { navigateTo } from './router'
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
      Promise.resolve([]),
    ])
    state.seasons = seasons
    state.roles = roles
    state.teams = teams
  }
}

initialize()

render(<App />, document.getElementById('app')!, state)
