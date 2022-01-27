import { h } from 'kaiku'
import config from '../../config'
import { t } from '../../state'

import styles from './Authentication.css'

const Authentication = () => {
  return (
    <div class={styles('authentication')}>
      Kirjaudu sisään rakentaaksesi unelmatiimisi!
      <a class={styles('discord-login')} href={config.discordOauth2Url}>
        Kirjaudu sisään Discordilla
        <div class={styles('logo')} />
      </a>
    </div>
  )
}

export default Authentication
