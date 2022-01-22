import { h } from 'kaiku'
import { state } from './state'
import { navigateTo } from './router'
import AdminPanel from './components/admin-panel/AdminPanel'
import TeamBuilder from './components/team-builder/TeamBuilder'
import Index from './components/index/Index'

const Router = () => {
  if (!state.route) {
    return <div>404</div>
  }

  switch (state.route.name) {
    case 'index':
      return <Index />
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
