import { h, useEffect, useState } from 'kaiku'
import PlayerSelector from '../player-selector/PlayerSelector'
import Teams from '../teams/Teams'
import styles from './TeamBuilder.css'

const TeamBuilder = () => {
  return (
    <div className={styles('team-builder')}>
      <Teams />
      <PlayerSelector />
    </div>
  )
}

export default TeamBuilder
