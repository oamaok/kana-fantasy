import { h } from 'kaiku'
import { state } from './state'
import { navigateTo } from './router'
import AdminPanel from './components/admin-panel/AdminPanel'
import TeamBuilder from './components/team-builder/TeamBuilder'

const Router = () => {
  switch (state.route.name) {
    case 'index':
      return <TeamBuilder />
    case 'scoreboard':
      return <div>scoreboard</div>
    case 'admin':
      return <AdminPanel />
    case 'oauthCallback':
      return <div onClick={() => navigateTo('/')}>oauth! </div>
    case 'notFound':
      return <div>404</div>
  }
}

export default Router
