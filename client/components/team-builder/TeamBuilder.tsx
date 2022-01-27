import { h, useEffect, useState } from 'kaiku'
import DivisionSelector from '../division-selector/DivisionSelector'
import PlayerSelector from '../player-selector/PlayerSelector'
import Teams from '../teams/Teams'
import styles from './TeamBuilder.css'

const TeamBuilder = () => {
  return (
    <div className={styles('team-builder')}>
      <DivisionSelector />
      <div className={styles('team')}>
        <Teams />
        <PlayerSelector />
      </div>
    </div>
  )
}

export default TeamBuilder
