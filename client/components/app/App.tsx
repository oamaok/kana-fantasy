import { h, Fragment } from 'kaiku'
import { state } from '../../state'
import Authentication from '../authentication/Authentication'
import Routes from '../../Routes'
import Header from '../header/Header'
import Teams from '../teams/Teams'
import styles from './App.css'

const SideBar = () => {
  switch (state.auth.type) {
    case 'unauthenticated':
      return (
        <div className={styles('sidebar')}>
          <Authentication />
        </div>
      )
    case 'loading':
      return (
        <div className={styles('sidebar', 'centered')}>
          <img src="/assets/loader.svg" className={styles('loader')} />{' '}
        </div>
      )
    case 'authenticated':
      return (
        <div className={styles('sidebar')}>
          {state.auth.user.username}

          <Teams />
        </div>
      )
  }

  return null
}

const App = () => {
  return (
    <div className={styles('app')}>
      <SideBar />
      <div className={styles('content-wrapper')}>
        <div className={styles('header')}></div>
        <div className={styles('content')}>
          <Routes />
        </div>

        <div className={styles('footer')}></div>
      </div>
    </div>
  )
}

export default App
