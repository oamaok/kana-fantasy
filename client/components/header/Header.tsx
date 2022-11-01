import { h } from 'kaiku'
import { getIsAdmin, state } from '../../state'

import styles from './Header.css'
import { logout, User } from '../../auth'
import { navigateTo } from '../../router'
import config from '../../config'

const getUserAvatar = (user: User) => {
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}`
}

const Header = () => {
  const isAdmin = getIsAdmin()

  return (
    <div className={styles('header')}>
      <div className={styles('logo')} />
      <nav>
        <button onClick={() => navigateTo('/')}>Etusivu</button>
        <button onClick={() => navigateTo('/team-builder')}>
          Rakenna joukkueesi
        </button>
        <button onClick={() => navigateTo('/highscores')}>Tulokset</button>
        {isAdmin && (
          <button onClick={() => navigateTo('/admin')}>Ylläpito</button>
        )}
      </nav>

      {state.auth.type === 'unauthenticated' && (
        <a class={styles('discord-login')} href={config.discordOauth2Url}>
          Kirjaudu sisään Discordilla
          <div class={styles('logo')} />
        </a>
      )}

      {state.auth.type === 'authenticated' && (
        <div className={styles('user')}>
          <img src={getUserAvatar(state.auth.user)} />
          {state.auth.user.username}
          <button className={styles('logout')} onClick={logout}>
            Kirjaudu ulos
          </button>
        </div>
      )}
    </div>
  )
}

export default Header
