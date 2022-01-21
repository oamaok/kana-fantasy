import { StatTarget } from '../../common/validators'

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

@Entity()
@Unique(['name'])
class PlayerRole extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  name!: string

  @Column()
  description!: string

  @Column('jsonb')
  targets!: StatTarget[]
}

export default PlayerRole
