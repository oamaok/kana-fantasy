import { createConnection } from 'typeorm'
import Player from './models/Player'
import Team from './models/Team'
import User from './models/User'
import Season from './models/Season'
import PlayerRole from './models/PlayerRole'

export const initializeConnection = () => {
  return createConnection({
    type: 'postgres',
    host: 'localhost',
    username: 'postgres',
    password: 'password',
    port: 5432,
    synchronize: true,

    entities: [User, Player, Team, Season, PlayerRole],
  })
}
