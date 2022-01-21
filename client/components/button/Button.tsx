import { h, FC } from 'kaiku'
import styles from './Button.css'

type Props = {
  type?: 'primary' | 'warning' | 'danger'
  onClick?: (evt: any) => void
}

const Button: FC<Props> = ({ type = 'primary', children, ...props }) => {
  return (
    <button className={styles('button', type)} {...props}>
      {children}
    </button>
  )
}

export default Button
