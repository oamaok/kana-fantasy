import { h, Fragment } from 'kaiku'
import { getCurrentTeam } from '../../state'
import DivisionSelector from '../division-selector/DivisionSelector'
import PlayerSelector from '../player-selector/PlayerSelector'
import RoleSelector from '../role-selector/RoleSelector'
import Teams from '../teams/Teams'
import styles from './TeamBuilder.css'

const TeamBuilder = () => {
  const team = getCurrentTeam()

  return (
    <div className={styles('team-builder')}>
      <DivisionSelector />
      <div className={styles('team')}>
        {team?.bought ? (
          <RoleSelector />
        ) : (
          <>
            <Teams />
            <PlayerSelector />
          </>
        )}
      </div>
    </div>
  )
}

export default TeamBuilder
