import { h, useState } from 'kaiku'
import {
  state,
  getCurrentTeam,
  getCurrentTeamPlayers,
  removePlayerFromCurrentTeam,
  getRemainingBudget,
} from '../../state'
import * as api from '../../api'
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

const onDivisionSelect = async (evt: InputEvent) => {
  state.division = (evt.target as HTMLSelectElement).value
  state.players = await api.getPlayers(
    state.route!.params.season,
    state.division
  )
}

const Teams = () => {
  const team = getCurrentTeam()
  const players = getCurrentTeamPlayers()
  const budgetRemaining = getRemainingBudget()

  return (
    <div className={styles('wrapper')}>
      <div className={styles('teams')}>
        <div className={styles('title')}>Joukkueesi</div>
        <div className={styles('details')}>
          <div className={styles('field')}>
            <label>Divisioona</label>
            <select onChange={onDivisionSelect}>
              {divisions.map((division) => (
                <option value={division} selected={state.division === division}>
                  {division}
                </option>
              ))}
            </select>
          </div>

          {team ? (
            <div className={styles('team')}>
              <div className={styles('field')}>
                <label>Nimi</label>
                <input
                  type="text"
                  value={team.name}
                  onInput={(evt: InputEvent) => {
                    team.name = (evt.target as HTMLInputElement).value
                  }}
                />
              </div>
              <div
                className={styles('budget', {
                  'over-budget': budgetRemaining < 0,
                })}
              >
                {formatPrice(budgetRemaining)}
              </div>
              <div className={styles('players')}>
                {players.map((player) => (
                  <div className={styles('slot')}>
                    <div className={styles('top-half')}>
                      <img src={player.avatar} className={styles('avatar')} />
                      <div className={styles('details')}>
                        <div className={styles('name')}>{player.username}</div>
                        <div className={styles('role-selector')}>
                          Valitse rooli...
                        </div>
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
          ) : (
            <div className={styles('new-team')}>
              <div>Sinulla ei ole vielä joukkuetta tässä divisioonassa.</div>
              <Button
                onClick={() => {
                  state.teams.push({
                    name: `Maailman paras ${state.division} joukkue`,
                    season: 9,
                    division: state.division,
                    players: [],
                  })
                }}
              >
                + Luo uusi joukkue
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Teams
