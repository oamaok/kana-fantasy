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
  const ongoingSeason = getOngoingSeason()

  if (!ongoingSeason) return null

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
