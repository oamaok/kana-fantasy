import { h, useState, useEffect, useRef } from 'kaiku'
import {
  state,
  getCurrentTeam,
  getCurrentTeamPlayers,
  removePlayerFromCurrentTeam,
  getRemainingBudget,
  getOngoingSeason,
} from '../../state'
import { formatDistance } from 'date-fns'
import styles from './Teams.css'
import { formatPrice } from '../../utils'
import Button from '../button/Button'

const divisions = [
  'Masters',
  'Challengers',
  'div2',
  'div3',
  'div4',
  'div5',
  'div6',
  'div7',
]

const Teams = () => {
  const localState = useState({
    timeUntilLocked: '----',
  })

  useEffect(() => {
    let interval = setInterval(() => {
      const ongoingSeason = getOngoingSeason()
      if (!ongoingSeason) return

      localState.timeUntilLocked = formatDistance(
        new Date(),
        new Date(ongoingSeason.lockDate)
      )
    }, 1000)
    return () => clearInterval(interval)
  })

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
  const teamsLocked = new Date(ongoingSeason?.lockDate)

  const isTeamFull = players.length === 5

  return (
    <div className={styles('wrapper')}>
      <div className={styles('teams')}>
        {team && (
          <div className={styles('team')}>
            {isTeamFull ? (
              <button className={styles('buy')}>Osta joukkue</button>
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
                      x
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
