import { h, useState } from 'kaiku'
import { getCurrentTeam, getCurrentTeamPlayers, state } from '../../state'

import styles from './RoleSelector.css'

const RoleSelector = () => {
  const players = getCurrentTeamPlayers()
  const roleSelector = useState({
    selectedPlayer: players[0].steamId,
  })

  return (
    <div className={styles('role-selector')}>
      <div className={styles('players')}>
        {players.map((player) => (
          <div
            className={styles('player', {
              selected: roleSelector.selectedPlayer,
            })}
          ></div>
        ))}
      </div>
      {state.roles.map((role) => (
        <div className={styles('role')}></div>
      ))}
    </div>
  )
}

export default RoleSelector
