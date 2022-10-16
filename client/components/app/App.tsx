import { h, Fragment } from 'kaiku'
import { state } from '../../state'
import Authentication from '../authentication/Authentication'
import Routes from '../../Routes'
import Header from '../header/Header'
import Teams from '../teams/Teams'
import Sidebar from '../sidebar/Sidebar'
import styles from './App.css'

const App = () => {
  return (
    <div className={styles('app')}>
      <Header />
      <div className={styles('content')}>
        <Routes />
      </div>

      <div className={styles('footer')}>
        <div className={styles('column')}>
          <h3>Kanaliiga Ry</h3>
        </div>
      </div>
    </div>
  )
}

export default App
