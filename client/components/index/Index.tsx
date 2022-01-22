import { h } from 'kaiku'
import { navigateTo } from '../../router'
import { state } from '../../state'

const Index = () => {
  const now = new Date()

  const ongoingSeason = state.seasons.find((season) => {
    return new Date(season.startDate) < now && new Date(season.endDate) > now
  })

  const signupsOpen = ongoingSeason && new Date(ongoingSeason.lockDate) > now

  if (signupsOpen) {
    return (
      <div>
        <button onClick={() => navigateTo('/team-builder/' + ongoingSeason.id)}>
          Osallistu kaudelle {ongoingSeason.name}
        </button>
      </div>
    )
  }

  return null
}

export default Index
