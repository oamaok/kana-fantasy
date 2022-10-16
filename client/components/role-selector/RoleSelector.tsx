import { h, useState } from 'kaiku'
import { getCurrentTeam, getCurrentTeamPlayers, state } from '../../state'
import Panel from '../panel/Panel'

import styles from './RoleSelector.css'

const RoleSelector = () => {
  const team = getCurrentTeam()
  const players = getCurrentTeamPlayers()

  const roleSelector = useState({
    selectedPlayer: 0,
  })

  if (players.length === 0) return null

  const selectedPlayer = team?.players[roleSelector.selectedPlayer]

  const selectedRoles: Record<number, string> = {}

  for (const p of team?.players ?? []) {
    if (p.roleId !== null) selectedRoles[p.roleId] = p.steamId
  }

  return (
    <Panel header="Pelaajien roolit" className={styles('role-selector')}>
      <div className={styles('players')}>
        {players.map((player, index) => {
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
                roleSelector.selectedPlayer = index
              }}
            >
              <img className={styles('avatar')} src={player.avatar} />
              <div className={styles('name')}>{player.username}</div>
              <div className={styles('team')}>{player.team}</div>
              <a
                className={styles('stats')}
                target="_blank"
                href={`https://stats.kanaliiga.fi/cs/#/players/${player.steamId}`}
              >
                Statistiikat
              </a>
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
              selected: selectedRoles[role.id] === selectedPlayer?.steamId,
              taken:
                selectedRoles[role.id] &&
                selectedRoles[role.id] !== selectedPlayer?.steamId,
            })}
            onClick={() => {
              if (selectedPlayer!.roleId === role.id) {
                selectedPlayer!.roleId = null
              } else {
                selectedPlayer!.roleId = role.id

                const nextWithoutARole = team?.players.findIndex(
                  (p, index) =>
                    p.roleId === null && index > roleSelector.selectedPlayer
                )
                if (typeof nextWithoutARole !== 'undefined')
                  roleSelector.selectedPlayer = nextWithoutARole
              }
            }}
          >
            <div className={styles('name')}>{role.name}</div>
            <div className={styles('description')}>{role.description}</div>
          </button>
        ))}
      </div>
    </Panel>
  )
}

export default RoleSelector
