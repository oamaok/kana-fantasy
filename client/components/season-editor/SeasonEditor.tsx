import { h, useState, useEffect } from 'kaiku'
import { state } from '../../state'
import Button from '../button/Button'
import * as api from '../../api'
import styles from './SeasonEditor.css'
import { Season } from '../../../common/validators'

const toDateInputFormat = (date: Date | string): string =>
  new Date(date).toISOString().substr(0, 10)

const formatDates = (season: Season): Season => {
  return {
    ...season,

    startDate: toDateInputFormat(season.startDate),
    endDate: toDateInputFormat(season.endDate),
    lockDate: toDateInputFormat(season.lockDate),
  }
}

const SeasonEditor = () => {
  const editor = useState({
    seasons: [] as Season[],
  })
  useEffect(() => {
    api.getSeasons().then((seasons) => {
      editor.seasons = seasons.map(formatDates)
    })
  })

  return (
    <div className={styles('season-editor')}>
      <h2>Muokkaa kausia</h2>
      {editor.seasons.map((season) => (
        <div className={styles('season')}>
          <input
            type="text"
            value={season.name}
            onInput={(evt: InputEvent) => {
              season.name = (evt.target as HTMLInputElement).value
            }}
          />
          Alku{' '}
          <input
            type="date"
            value={season.startDate}
            onInput={(evt: InputEvent) => {
              season.startDate = (evt.target as HTMLInputElement).value
            }}
          />
          Loppu{' '}
          <input
            type="date"
            value={season.endDate}
            onInput={(evt: InputEvent) => {
              season.endDate = (evt.target as HTMLInputElement).value
            }}
          />
          Tiimien lukitus{' '}
          <input
            type="date"
            value={season.lockDate}
            onInput={(evt: InputEvent) => {
              season.lockDate = (evt.target as HTMLInputElement).value
            }}
          />
        </div>
      ))}
      <Button
        onClick={async () => {
          // TODO: Maybe diff the seasons so only the ones changed
          // will be updated
          const seasons = await api.saveSeasons(editor.seasons)
          state.seasons = seasons
          editor.seasons = seasons.map(formatDates)
        }}
      >
        Tallenna kaudet
      </Button>
    </div>
  )
}

export default SeasonEditor
