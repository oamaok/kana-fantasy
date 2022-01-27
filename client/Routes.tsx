import { h } from 'kaiku'
import { state } from './state'
import { navigateTo } from './router'
import AdminPanel from './components/admin-panel/AdminPanel'
import TeamBuilder from './components/team-builder/TeamBuilder'
import Index from './components/index/Index'
import PlayerSelector from './components/player-selector/PlayerSelector'
import Authentication from './components/authentication/Authentication'

const Router = () => {
  if (!state.route) {
    return <div>404</div>
  }

  if (state.route.name === 'index') {
    return <Index />
  }

  if (state.auth.type === 'unauthenticated') {
    return <Authentication />
  }

  switch (state.route.name) {
    case 'team-builder':
      return <TeamBuilder />
    case 'scoreboard':
      return <div>scoreboard</div>
    case 'admin':
      return <AdminPanel />
    case 'oauth-callback':
      return <div onClick={() => navigateTo('/')}>oauth! </div>
  }
}

export default Router
