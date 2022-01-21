import { h, Fragment } from 'kaiku'
import { state } from '../../state'
import Authentication from '../authentication/Authentication'
import Routes from '../../Routes'
import Header from '../header/Header'

const App = () => {
  if (state.route.name === 'oauthCallback' || state.auth.type === 'loading') {
    return <div>Loading...</div>
  }

  return (
    <>
      <Header />
      <div>
        {state.auth.type === 'authenticated' ? <Routes /> : <Authentication />}
      </div>
    </>
  )
}

export default App
