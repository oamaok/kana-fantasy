import { h } from 'kaiku'
import { navigateTo } from '../../router'
import { getOngoingSeason, state } from '../../state'

const Index = () => {
  const now = new Date()
  const ongoingSeason = getOngoingSeason()
  const signupsOpen = ongoingSeason && new Date(ongoingSeason.lockDate) > now

  if (signupsOpen) {
    return (
      <div>
        <button onClick={() => navigateTo('/team-builder/')}>
          Osallistu kaudelle {ongoingSeason.name}
        </button>
      </div>
    )
  }

  return null
}

export default Index
