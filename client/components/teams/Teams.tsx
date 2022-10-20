import { h, useEffect } from 'kaiku'
import {
  state,
  getCurrentTeam,
  getCurrentTeamPlayers,
  removePlayerFromCurrentTeam,
  getRemainingBudget,
  getOngoingSeason,
} from '../../state'
import * as api from '../../api'
import styles from './Teams.css'
import { formatPrice } from '../../utils'

const buyTeam = () => {
  const team = getCurrentTeam()
  if (!team) return
  team.bought = true

  api.buyTeam(team)
}

const Teams = () => {
  useEffect(() => {
    const currentTeam = getCurrentTeam()

    if (state.teams && !currentTeam) {
      // Needs to be deferred
      // TODO: Fix in kaiku
      const ongoingSeason = getOngoingSeason()
      if (ongoingSeason) {
        requestAnimationFrame(() => {
          state.teams?.push({
            name: '',
            division: state.division,
            season: ongoingSeason.id,
            bought: false,
            players: [],
          })
        })
      }
    }
  })

  const ongoingSeason = getOngoingSeason()

  if (!ongoingSeason) {
    return <div>Ei meneillään olevaa kautta</div>
  }

  const team = getCurrentTeam()
  const players = getCurrentTeamPlayers()
  const budgetRemaining = getRemainingBudget()

  const isTeamFull = players.length === 5

  return (
    <div className={styles('wrapper')}>
      <div className={styles('teams')}>
        {team && (
          <div className={styles('team')}>
            {isTeamFull ? (
              <button className={styles('buy')} onClick={buyTeam}>
                Osta joukkue
              </button>
            ) : (
              <div
                className={styles('budget', {
                  'over-budget': budgetRemaining < 0,
                })}
              >
                {formatPrice(budgetRemaining)}
              </div>
            )}

            <div className={styles('players')}>
              {players.map((player) => (
                <div className={styles('slot')}>
                  <div className={styles('top-half')}>
                    <img src={player.avatar} className={styles('avatar')} />
                    <div className={styles('details')}>
                      <div className={styles('team')}>{player.team}</div>
                      <div className={styles('name')}>{player.username}</div>
                    </div>
                    <button
                      className={styles('remove')}
                      onClick={() => removePlayerFromCurrentTeam(player)}
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                  <div className={styles('price')}>
                    {formatPrice(player.price)}
                  </div>
                </div>
              ))}
              {Array(5 - players.length)
                .fill(null)
                .map(() => (
                  <div className={styles('slot', 'empty')}>Tyhjä</div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Teams
