import { h, useState } from 'kaiku'
import { getCurrentTeam, getCurrentTeamPlayers, state } from '../../state'

import styles from './RoleSelector.css'

const RoleSelector = () => {
  const team = getCurrentTeam()
  const players = getCurrentTeamPlayers()

  const roleSelector = useState({
    selectedPlayer: null as null | string,
  })

  if (players.length === 0) return null

  const selectedPlayer =
    team?.players.find((p) => p.steamId === roleSelector.selectedPlayer) ||
    team?.players[0]

  return (
    <div className={styles('role-selector')}>
      <div className={styles('title')}>Pelaajien roolit</div>
      <div className={styles('players')}>
        {players.map((player) => {
          const roleId = team?.players.find(
            (p) => p.steamId === player.steamId
          )?.roleId
          const role = state.roles.find((r) => r.id === roleId)

          return (
            <button
              className={styles('player', {
                selected: selectedPlayer?.steamId === player.steamId,
              })}
              onClick={() => {
                roleSelector.selectedPlayer = player.steamId
              }}
            >
              <img className={styles('avatar')} src={player.avatar} />
              <div className={styles('name')}>{player.username}</div>
              <div className={styles('team')}>{player.team}</div>

              <div className={styles('player-role', { 'not-chosen': !role })}>
                {role ? role.name : 'Ei roolia'}
              </div>
            </button>
          )
        })}
      </div>
      <div className={styles('roles')}>
        {state.roles.map((role) => (
          <button
            className={styles('role', {
              selected: team?.players.some(
                (p) =>
                  p.roleId == role.id && selectedPlayer?.steamId === p.steamId
              ),
            })}
            onClick={() => {
              selectedPlayer!.roleId = role.id
            }}
          >
            <div className={styles('name')}>{role.name}</div>
            <div className={styles('description')}>{role.description}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default RoleSelector
