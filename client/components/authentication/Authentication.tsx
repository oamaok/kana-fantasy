import { h } from 'kaiku'
import config from '../../config'
import { t } from '../../state'

import styles from './Authentication.css'

const Authentication = () => {
  return (
    <div class={styles('authentication')}>
      {t('auth.required')}
      <a class={styles('discord-login')} href={config.discordOauth2Url}>
        {t('auth.login_with_discord')}
        <div class={styles('logo')} />
      </a>
    </div>
  )
}

export default Authentication
