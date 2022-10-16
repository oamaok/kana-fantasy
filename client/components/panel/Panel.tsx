import { FC, h } from 'kaiku'
import styles from './Panel.css'

type Props = {
  header?: string
  className?: string
}

const Panel: FC<Props> = ({ header, className, children }) => {
  return (
    <div className={styles('panel', className ?? '')}>
      {header && <div className={styles('header')}>{header}</div>}
      <div className={styles('body')}>{children}</div>
    </div>
  )
}

export default Panel
