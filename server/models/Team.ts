import {
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  Column,
  ManyToMany,
  JoinTable,
  BaseEntity,
  ManyToOne,
} from 'typeorm'
import Player from './Player'
import User from './User'
import Season from './Season'

@Entity()
@Unique(['division', 'season', 'user'])
class Team extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  name!: string

  @Column()
  division!: string

  @Column()
  season!: number

  @Column({ type: 'jsonb' })
  players!: { steamId: string; role: number | null }[]

  @ManyToOne(() => User, (user) => user.teams)
  user!: User
}

export default Team
