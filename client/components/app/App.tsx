import { h, Fragment } from 'kaiku'
import { state } from '../../state'
import Authentication from '../authentication/Authentication'
import Routes from '../../Routes'
import Header from '../header/Header'
import styles from './App.css'

const App = () => {
  if (state.route?.name === 'oauth-callback' || state.auth.type === 'loading') {
    return <div>Loading...</div>
  }

  return (
    <div className={styles('app')}>
      <Header />
      <div className={styles('content')}>
        {state.auth.type === 'authenticated' ? <Routes /> : <Authentication />}
      </div>
      <div className={styles('footer')}>Footer</div>
    </div>
  )
}

export default App
