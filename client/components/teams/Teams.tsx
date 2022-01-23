import { h, useState, useEffect, useRef } from 'kaiku'
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
  state.players = []
  state.players = await api.getPlayers(
    state.route!.params.season,
    state.division
  )
}

const Teams = () => {
  const marginRef = useRef<HTMLDivElement>()
  const sidebarRef = useRef<HTMLDivElement>()

  useEffect(() => {
    api
      .getPlayers(state.route!.params.season, state.division)
      .then((players) => {
        state.players = players
      })

    let scrollTop = document.documentElement.scrollTop
    let previousDirection: 'DOWN' | 'UP' | null = null

    const scrollHandler = (evt: Event) => {
      const direction =
        document.documentElement.scrollTop < scrollTop ? 'UP' : 'DOWN'
      scrollTop = document.documentElement.scrollTop

      if (previousDirection === direction) return
      previousDirection = direction

      if (marginRef.current && sidebarRef.current) {
        const sidebarHeight = sidebarRef.current.getBoundingClientRect().height

        if (sidebarHeight < window.innerHeight - 100) {
          marginRef.current.style.marginTop = '0px'
          sidebarRef.current.style.top = `${100}px`
          return
        }

        if (direction === 'DOWN') {
          marginRef.current.style.marginTop = `${scrollTop}px`
          sidebarRef.current.style.top = `${
            window.innerHeight - sidebarHeight
          }px`
          sidebarRef.current.style.bottom = ''
        } else {
          marginRef.current.style.marginTop = `${
            scrollTop + (window.innerHeight - sidebarHeight - 100)
          }px`
          sidebarRef.current.style.bottom = `${
            window.innerHeight - sidebarHeight - 100
          }px`
          sidebarRef.current.style.top = ''
        }
      }
    }

    document.addEventListener('scroll', scrollHandler)

    return () => document.removeEventListener('scroll', scrollHandler)
  })

  useEffect(() => {
    const currentTeam = getCurrentTeam()

    console.log({ currentTeam })

    if (state.teams && !currentTeam) {
      console.log(state.teams)

      state.teams.push({
        name: `Paras ${state.division} joukkue`,
        division: state.division,
        season: parseInt(state.route!.params.season),
        players: [],
      })
    }
  })

  const team = getCurrentTeam()
  const players = getCurrentTeamPlayers()
  const budgetRemaining = getRemainingBudget()

  return (
    <div className={styles('wrapper')}>
      <div ref={marginRef} />
      <div className={styles('teams')} ref={sidebarRef}>
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

          {team && (
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
          )}
        </div>
      </div>
    </div>
  )
}

export default Teams
