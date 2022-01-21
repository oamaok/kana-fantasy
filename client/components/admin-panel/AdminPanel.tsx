import { h } from 'kaiku'
import SeasonEditor from '../season-editor/SeasonEditor'
import RoleEditor from '../role-editor/RoleEditor'
import styles from './AdminPanel.css'

const AdminPanel = () => {
  return (
    <div className={styles('admin-panel')}>
      <SeasonEditor />
      <RoleEditor />
    </div>
  )
}

export default AdminPanel
