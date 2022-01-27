import { h, useState, useEffect, immutable } from 'kaiku'
import { stats } from '../../../common/stats'
import * as api from '../../api'
import Button from '../button/Button'

import { RoleUpdateRequest, Stat, StatTarget } from '../../../common/validators'

import styles from './RoleEditor.css'

const getBoundaries = (
  target: StatTarget,
  stats: Record<Stat, number[]> | null
): [number, number] => {
  if (!stats) return [0, 0]

  const values = stats[target.stat]

  let lowerBoundary: number | any = null
  let higherBoundary: number | any = null

  for (let i = 0; i < values.length; i++) {
    if (lowerBoundary === null) {
      if (values[i] > target.target - target.margin) {
        lowerBoundary = i / values.length
      }
    } else if (higherBoundary === null) {
      if (values[i] > target.target + target.margin) {
        higherBoundary = i / values.length
      }
    } else {
      return [lowerBoundary, higherBoundary]
    }
  }

  if (lowerBoundary === null) {
    return [1, 0]
  }

  return [lowerBoundary, 1 - lowerBoundary]
}

const RoleEditor = () => {
  const editor = useState({
    roles: [] as RoleUpdateRequest,
    stats: null as Record<Stat, number[]> | null,
  })

  useEffect(() => {
    api.getRolesWithTargets().then(async (roles) => {
      editor.roles = roles
      editor.stats = immutable(
        await fetch('/assets/stats.json').then((res) => res.json())
      )
    })
  })

  return (
    <div className={styles('role-editor')}>
      <h3>Muokkaa rooleja</h3>
      <div className={styles('roles')}>
        {editor.roles.map((role) => (
          <div className={styles('role')}>
            <div
              className={styles('field', {
                error:
                  editor.roles.filter((r) => r.name === role.name).length > 1,
              })}
            >
              <label>
                Nimi{' '}
                <span className={styles('error-text')}>
                  Tämä roolinimi on jo käytössä!
                </span>
              </label>
              <input
                type="text"
                value={role.name}
                onInput={(evt: InputEvent) => {
                  role.name = (evt.target as HTMLInputElement).value
                }}
              />
            </div>
            <div className={styles('field')}>
              <label>Roolin kuvaus</label>
              <textarea
                value={role.description}
                onInput={(evt: InputEvent) => {
                  role.description = (evt.target as HTMLInputElement).value
                }}
              />
            </div>
            <label>Tavoitteet</label>
            <div className={styles('targets')}>
              {role.targets.map((target) => {
                const [lowerBoundary, higherBoundary] = getBoundaries(
                  target,
                  editor.stats
                )

                const underperformWidth = lowerBoundary
                const expectedWidth = higherBoundary - lowerBoundary
                const overperformWidth = 1 - (lowerBoundary + expectedWidth)

                return (
                  <div className={styles('target')}>
                    <select
                      onChange={(evt: InputEvent) => {
                        target.stat = (evt.target as HTMLSelectElement)
                          .value as Stat
                      }}
                    >
                      {stats.map((stat) => (
                        <option value={stat} selected={stat === target.stat}>
                          {stat}
                        </option>
                      ))}
                    </select>
                    <div className={styles('target-values')}>
                      <div className={styles('field')}>
                        <label>Target</label>
                        <input
                          type="number"
                          step="1"
                          value={target.target}
                          onInput={(evt: InputEvent) => {
                            target.target = parseFloat(
                              (evt.target as HTMLInputElement).value
                            )
                          }}
                        />
                      </div>
                      <div className={styles('field')}>
                        <label>Margin</label>
                        <input
                          type="number"
                          step="1"
                          min="1"
                          value={target.margin}
                          onInput={(evt: InputEvent) => {
                            target.margin = parseFloat(
                              (evt.target as HTMLInputElement).value
                            )
                          }}
                        />
                      </div>
                    </div>
                    <div className={styles('boundaries')}>
                      <div
                        className={styles('underperform')}
                        style={{ width: `${underperformWidth * 100}%` }}
                      />
                      <div
                        className={styles('expected')}
                        style={{ width: `${expectedWidth * 100}%` }}
                      />
                      <div
                        className={styles('overperform')}
                        style={{ width: `${overperformWidth * 100}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
            <Button
              onClick={() =>
                role.targets.push({
                  stat: 'ADR',
                  inverted: false,
                  target: 0,
                  margin: 1,
                })
              }
            >
              Lisää tavoite
            </Button>
          </div>
        ))}
      </div>
      <Button
        onClick={() =>
          editor.roles.push({
            id: null,
            name: 'Uusi rooli',
            description: 'Tämä on uusi rooli!',
            targets: [],
          })
        }
      >
        Lisää rooli
      </Button>

      <Button
        onClick={async () => {
          editor.roles = await api.saveRoles(editor.roles)
        }}
      >
        Tallenna roolit
      </Button>
    </div>
  )
}

export default RoleEditor
