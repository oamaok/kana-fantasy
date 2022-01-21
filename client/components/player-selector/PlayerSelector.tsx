import { h, useEffect, useState } from 'kaiku'
import { state } from '../../state'
import { navigateTo } from './router'
import { IPlayer } from '../../../common/interfaces'
import * as api from '../../api'

import styles from './PlayerSelector.css'
import { formatPrice } from '../../utils'
import { addPlayerToCurrentTeam } from '../../state'

const PlayerSelector = () => {
  const groupedPlayers: Record<string, IPlayer[]> = {}

  for (const player of state.players) {
    if (!groupedPlayers[player.teamName]) {
      groupedPlayers[player.teamName] = []
    }

    groupedPlayers[player.teamName].push(player)
  }

  const teams = Object.keys(groupedPlayers)

  return (
    <div className={styles('teams')}>
      {teams.map((teamName) => (
        <div className={styles('team')}>
          <div className={styles('team-name')}>{teamName}</div>
          <div className={styles('players')}>
            {groupedPlayers[teamName].map((player) => (
              <div
                className={styles('player')}
                onClick={() => addPlayerToCurrentTeam(player)}
              >
                <div className={styles('details')}>
                  <img src={player.avatar} className={styles('avatar')} />
                  <div className={styles('name')}>{player.name}</div>
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
