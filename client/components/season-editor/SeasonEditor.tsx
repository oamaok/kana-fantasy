import { h, useState } from 'kaiku'
import Button from '../button/Button'
import styles from './SeasonEditor.css'

type Season = {
  id: number
  name: string
  startDate: Date
  endDate: Date
  lockDate: Date
}

const toDateInputFormat = (date: Date): string =>
  date.toISOString().substr(0, 10)

const SeasonEditor = () => {
  const editor = useState({
    seasons: [] as Season[],
  })

  return (
    <div className={styles('season-editor')}>
      <h2>Muokkaa kausia</h2>
      {editor.seasons.map((season) => (
        <div className={styles('season')}>
          <input
            type="text"
            value={season.name}
            onInput={(evt) => {
              season.name = evt.target.value
            }}
          />
          Alku{' '}
          <input
            type="date"
            value={toDateInputFormat(season.startDate)}
            onInput={(evt) => {
              season.startDate = new Date(evt.target.value)
            }}
          />
          Loppu{' '}
          <input
            type="date"
            value={toDateInputFormat(season.endDate)}
            onInput={(evt) => {
              season.endDate = new Date(evt.target.value)
            }}
          />
          Tiimien lukitus{' '}
          <input
            type="date"
            value={toDateInputFormat(season.lockDate)}
            onInput={(evt) => {
              season.lockDate = new Date(evt.target.value)
            }}
          />
        </div>
      ))}
      <Button
        onClick={() => {
          editor.seasons.push({
            id: -1,
            name: 'Uusi kausi',
            startDate: new Date(),
            endDate: new Date(),
            lockDate: new Date(),
          })
        }}
      >
        + Uusi kausi
      </Button>
    </div>
  )
}

export default SeasonEditor
