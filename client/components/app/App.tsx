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
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eget
        consectetur augue. Ut pulvinar urna placerat, sollicitudin dolor a,
        commodo purus. Integer a nibh mauris. Etiam semper bibendum lacus, a
        tincidunt nisl pulvinar in. Sed porta tellus sit amet tellus accumsan, a
        porta sapien eleifend. Aenean id odio ac sapien blandit gravida. Aliquam
        rhoncus, lectus eu finibus mollis, dolor eros porta odio, sit amet
        pretium turpis nisl et purus. Integer eu nulla cursus, mollis eros at,
        faucibus justo. Maecenas at nunc id odio vestibulum mollis sed sed
        mauris. Vestibulum bibendum urna in tortor dignissim, ac vehicula mi
        aliquam. Donec congue interdum posuere. Aliquam in purus a lacus ornare
        congue. Suspendisse vitae purus quis mauris condimentum pulvinar eu in
        enim.
      </div>
    </div>
  )
}

export default App
