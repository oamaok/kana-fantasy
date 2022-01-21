import { Entity, PrimaryColumn, Column, BaseEntity, OneToMany } from 'typeorm'
import Team from './Team'

@Entity()
class User extends BaseEntity {
  @PrimaryColumn()
  id!: string

  @Column()
  discordName!: string

  @Column({ default: false })
  isAdmin!: boolean

  @Column({ type: 'text', nullable: true })
  avatar!: string | null

  @OneToMany(() => Team, (team) => team.user)
  teams!: Team[]
}

export default User
