import { h, useEffect } from 'kaiku'
import SeasonEditor from '../season-editor/SeasonEditor'
import RoleEditor from '../role-editor/RoleEditor'
import styles from './AdminPanel.css'
import { state } from '../../state'

const AdminPanel = () => {
  if (state.auth.type !== 'authenticated' || !state.auth.user.isAdmin) {
    return <div>Sinun ei pitäisäi olla täällä!</div>
  }

  return (
    <div className={styles('admin-panel')}>
      <SeasonEditor />
      <RoleEditor />
    </div>
  )
}

export default AdminPanel
