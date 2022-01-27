import { h, Fragment } from 'kaiku'
import { state } from '../../state'
import Authentication from '../authentication/Authentication'
import Routes from '../../Routes'
import Header from '../header/Header'
import Teams from '../teams/Teams'
import styles from './Sidebar.css'
import { logout } from '../../auth'

const Sidebar = () => {
  switch (state.auth.type) {
    case 'unauthenticated':
      return (
        <div className={styles('sidebar')}>
          <Authentication />
        </div>
      )
    case 'loading':
      return (
        <div className={styles('sidebar', 'centered')}>
          <img src="/assets/loader.svg" className={styles('loader')} />{' '}
        </div>
      )
    case 'authenticated':
      const { user } = state.auth
      return (
        <div className={styles('sidebar')}>
          <div className={styles('user')}>
            <img
              src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}`}
            />
            {user.username}
            <button className={styles('logout')} onClick={logout}>
              Kirjaudu ulos
            </button>
          </div>
          <Teams />
        </div>
      )
  }

  return null
}

export default Sidebar
