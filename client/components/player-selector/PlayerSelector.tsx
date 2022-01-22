import { h, useEffect, useState } from 'kaiku'
import {
  getCurrentTeam,
  getCurrentTeamPlayers,
  getRemainingBudget,
  state,
} from '../../state'
import * as api from '../../api'

import styles from './PlayerSelector.css'
import { Player } from '../../../common/types'
import { formatPrice } from '../../utils'
import { addPlayerToCurrentTeam } from '../../state'

const PlayerSelector = () => {
  const groupedPlayers: Record<string, Player[]> = {}

  for (const player of state.players) {
    if (!groupedPlayers[player.team]) {
      groupedPlayers[player.team] = []
    }

    groupedPlayers[player.team].push(player)
  }

  const selectedPlayers = new Set(
    getCurrentTeam()?.players.map((p) => p.steamId)
  )
  const budgetRemaining = getRemainingBudget()

  const teams = Object.keys(groupedPlayers)

  return (
    <div className={styles('teams')}>
      {teams.map((team) => (
        <div className={styles('team')}>
          <div className={styles('team-name')}>{team}</div>
          <div className={styles('players')}>
            {groupedPlayers[team].map((player) => (
              <div
                className={styles('player', {
                  selected: selectedPlayers.has(player.steamId),
                  'too-expensive': budgetRemaining < player.price,
                })}
                onClick={() => addPlayerToCurrentTeam(player)}
              >
                <div className={styles('details')}>
                  <img src={player.avatar} className={styles('avatar')} />
                  <div className={styles('name')}>{player.username}</div>
                </div>
                <div className={styles('price')}>
                  {formatPrice(player.price)}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default PlayerSelector
