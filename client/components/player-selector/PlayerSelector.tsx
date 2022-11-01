import { h, useState } from 'kaiku'

import { getCurrentTeam, getRemainingBudget, state } from '../../state'

import styles from './PlayerSelector.css'
import { Player } from '../../../common/types'
import { formatPrice } from '../../utils'
import { addPlayerToCurrentTeam } from '../../state'
import * as api from '../../api'
import Panel from '../panel/Panel'

const MAX_PLAYERS_SELECTED_PER_TEAM = 2

const priceToRank = (price: number) => {
  if (price > 210000) return 'gold'
  if (price < 190000) return 'bronze'
  return 'silver'
}

const PlayerSelector = () => {
  const selectorState = useState<{
    selectedCard: string | null
    stats: null | Record<string, number>
  }>({
    selectedCard: null,
    stats: null,
  })

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
          <div
            className={styles('players', {
              inspecting: selectorState.selectedCard !== null,
            })}
          >
            {groupedPlayers[team].map((player) => (
              <div
                className={styles('perspective', {
                  inspecting: selectorState.selectedCard === player.steamId,
                })}
              >
                <div
                  className={styles('player-card', priceToRank(player.price), {
                    selected: selectedPlayers.has(player.steamId),
                    'too-expensive': budgetRemaining < player.price,
                    inspecting: selectorState.selectedCard === player.steamId,
                  })}
                  onClick={async () => {
                    if (selectedPlayers.has(player.steamId)) return
                    if (selectorState.selectedCard === player.steamId) {
                      selectorState.selectedCard = null
                      selectorState.stats = null
                      return
                    }

                    selectorState.selectedCard = player.steamId
                    selectorState.stats = null
                    selectorState.stats = await api.getPlayerStats(
                      player.steamId
                    )
                  }}
                >
                  <div className={styles('selected-label')}>Valittu</div>
                  <div className={styles('too-expensitve-label')}>Ei varaa</div>
                  <div className={styles('front')}>
                    <div className={styles('details')}>
                      <img src={player.avatar} className={styles('avatar')} />
                      <h4 className={styles('name')}>{player.username}</h4>
                    </div>
                    <div className={styles('price')}>
                      {formatPrice(player.price)}
                    </div>
                  </div>
                  <div className={styles('back')}>
                    <div className={styles('header')}>
                      <img src={player.avatar} />
                      <div className={styles('gradient')} />
                      <h4 className={styles('name')}>{player.username}</h4>
                      <div className={styles('price')}>
                        {formatPrice(player.price)}
                      </div>
                    </div>
                    {selectorState.stats && (
                      <div className={styles('stats')}>
                        <div className={styles('label')}>Rating</div>{' '}
                        <div className={styles('value')}>
                          {selectorState.stats.rating.toFixed(2)}
                        </div>
                        <div className={styles('label')}>HS%</div>{' '}
                        <div className={styles('value')}>
                          {selectorState.stats.hsPercent.toFixed(0)}%
                        </div>
                        <div className={styles('label')}>ADR</div>{' '}
                        <div className={styles('value')}>
                          {selectorState.stats.adr.toFixed(0)}
                        </div>
                        <div className={styles('label')}>K/D</div>{' '}
                        <div className={styles('value')}>
                          {selectorState.stats.kdRatio.toFixed(2)}
                        </div>
                      </div>
                    )}
                    <button
                      className={styles('select')}
                      onClick={() => {
                        addPlayerToCurrentTeam(player)
                        selectorState.selectedCard = null
                        selectorState.stats = null
                      }}
                    >
                      <span class="material-symbols-outlined">person_add</span>
                    </button>
                  </div>
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
