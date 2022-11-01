import { h, useEffect, useState } from 'kaiku'
import * as api from '../../api'
import { getOngoingSeason, state } from '../../state'
import Panel from '../panel/Panel'
import styles from './DivisionSelector.css'

const onDivisionSelect = async (div: string) => {
  const ongoingSeason = getOngoingSeason()

  if (!ongoingSeason) return

  state.division = div
  state.players = []
  state.players = await api.getPlayers(ongoingSeason.id, state.division)
}

const DivisionSelector = () => {
  const selectorState = useState({
    timeLeft: 0
  })

  const ongoingSeason = getOngoingSeason()

  useEffect(() => {
    const interval = setInterval(() => {
      const season = getOngoingSeason()
      if (!season) return

      console.log((new Date(season.lockDate)).getTime(), Date.now())

      selectorState.timeLeft = (new Date(season.lockDate)).getTime() - Date.now()
    }, 1000)

    return () => clearInterval(interval)
  })

  if (!ongoingSeason) return null

  const days = Math.floor(selectorState.timeLeft /  1000 / 60 / 60 / 24)
  const hours = Math.floor(selectorState.timeLeft /  1000 / 60 / 60) % 24
  const minutes = Math.floor(selectorState.timeLeft /  1000 / 60) % 60
  const seconds = Math.floor(selectorState.timeLeft /  1000) % 60

  return (
    <Panel header="Valitse divisioona" className={styles('divison-selector')}>
      <div className={styles('divisions')}>
        {ongoingSeason.divisions.map((division) => (
          <button
            className={() => styles({ selected: division === state.division })}
            onClick={() => onDivisionSelect(division)}
          >
            {division}
          </button>
        ))}
      </div>
    </Panel>
  )
}

export default DivisionSelector
