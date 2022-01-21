import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  Unique,
  PrimaryColumn,
} from 'typeorm'
import { IPlayer } from '../../common/interfaces'

@Entity()
@Unique(['season', 'steamId'])
class Player extends BaseEntity implements IPlayer {
  @PrimaryColumn()
  steamId!: string

  @Column()
  name!: string

  @Column()
  avatar!: string

  @Column()
  teamName!: string

  @Column()
  price!: number

  @Column()
  season!: number

  @Column()
  division!: string
}

export default Player
