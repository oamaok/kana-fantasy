import { h } from 'kaiku'
import { state } from '../../state'

import * as api from '../../api'

import styles from './Header.css'
import { logout, User } from '../../auth'
import Button from '../button/Button'

const getUserAvatar = (user: User) => {
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}`
}

const Header = () => {
  return (
    <div className={styles('header')}>
      <div className={styles('logo')} />
      {state.auth.type === 'authenticated' && (
        <div className={styles('user')}>
          <img src={getUserAvatar(state.auth.user)} />
          <div>{state.auth.user.discordName}</div>
          <Button onClick={logout}>Kirjaudu ulos</Button>
        </div>
      )}
    </div>
  )
}

export default Header
