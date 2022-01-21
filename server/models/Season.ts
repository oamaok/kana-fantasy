import {
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  Column,
  ManyToMany,
  JoinTable,
  BaseEntity,
  ManyToOne,
  OneToMany,
} from 'typeorm'

import Team from './Team'

@Entity()
class Season extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  name!: string

  @Column()
  startDate!: Date

  @Column()
  endDate!: Date

  @Column()
  lockDate!: Date

  @Column({ type: 'jsonb' })
  divisions!: string[]

  @OneToMany(() => Team, (team) => team.season)
  teams!: Team[]
}

export default Season
