import { h } from 'kaiku'

import { getCurrentTeam, getRemainingBudget, state } from '../../state'

import styles from './PlayerSelector.css'
import { Player } from '../../../common/types'
import { formatPrice } from '../../utils'
import { addPlayerToCurrentTeam } from '../../state'
import Panel from '../panel/Panel'

const MAX_PLAYERS_SELECTED_PER_TEAM = 2

const PlayerSelector = () => {
  const selectedPlayers = new Set(
    getCurrentTeam()?.players.map((p) => p.steamId)
  )

  const groupedPlayers: Record<string, Player[]> = {}
  const playersPerTeam: Record<string, number> = {}

  for (const player of state.players) {
    if (!groupedPlayers[player.team]) {
      groupedPlayers[player.team] = []
    }
    groupedPlayers[player.team].push(player)

    if (typeof playersPerTeam[player.team] === 'undefined') {
      playersPerTeam[player.team] = 0
    }
    if (selectedPlayers.has(player.steamId)) {
      playersPerTeam[player.team]++
    }
  }

  const budgetRemaining = getRemainingBudget()
  const teams = Object.keys(groupedPlayers)

  return (
    <div className={styles('teams')}>
      {teams.map((team) => (
        <Panel
          header={team}
          className={styles({
            'player-limit-reached':
              playersPerTeam[team] >= MAX_PLAYERS_SELECTED_PER_TEAM,
          })}
        >
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
          <div className={styles('limit')}>
            <span>
              Voit valita enintään {MAX_PLAYERS_SELECTED_PER_TEAM} pelaajaa per
              joukkue.
            </span>
          </div>
        </Panel>
      ))}
    </div>
  )
}

export default PlayerSelector
