import fs from 'fs'
import data from '../../scraped-data.json'
import { Stat } from '../../common/validators'
import { stats } from '../../common/stats'
import { match } from 'fp-ts/lib/Option'

const playerIds = Object.keys(data.players)

let avgRating = 0
let players = 0

const sample = {
  id: 1,
  steamID: '76561198014292211',
  matchID: 5172,
  Team: 2,
  Kills: 20,
  Deaths: 12,
  Assists: 5,
  MVPs: 5,
  totalDamage: 1991,
  headshots: 4,
  flashAssists: 0,
  ADR: 90.5,
  hsPercent: 20,
  Plants: 1,
  Explodes: 1,
  Defuses: 1,
  firstKills: 3,
  Kills1: 9,
  Kills2: 2,
  Kills3: 1,
  Kills4: 1,
  Kills5: 0,
  Trades: 0,
  Traded: 2,
  clutchesWon: 0,
  AWPKills: 13,
  utilityDamage: 109,
  KillsThroughWalls: 2,
  flashesThrown: 11,
  enemiesFlashed: 13,
  matesFlashed: 4,
  selfFlashes: 4,
  firstDeaths: 5,
  totalMFDuration: 11.1,
  totalEFDuration: 51.6,
  oneVoneWon: 1,
  oneVoneLost: 0,
  KAST: 77,
  kanaRating: 1.04,
  firstKills_T: 0,
  firstKills_CT: 3,
  firstDeaths_T: 3,
  firstDeaths_CT: 2,
  FirstDeath_Trades: 0,
  FirstDeath_Traded: 1,
  FirstDeath_Trades_CT: 0,
  FirstDeath_Traded_CT: 0,
  FirstDeath_Trades_T: 0,
  FirstDeath_Traded_T: 1,
  flashesThrown_T: 6,
  flashesThrown_CT: 5,
  enemiesFlashed_T: 5,
  enemiesFlashed_CT: 8,
  Kills_T: 4,
  Kills_CT: 16,
  Deaths_T: 5,
  Deaths_CT: 7,
  Trades_T: 0,
  Trades_CT: 0,
  Traded_T: 1,
  Traded_CT: 1,
  totalEFDuration_CT: 31,
  totalEFDuration_T: 21,
  totalMFDuration_T: 7,
  totalMFDuration_CT: 4,
  matesFlashed_T: 3,
  matesFlashed_CT: 1,
  ttd: 194,
  CrosshairPlacement: 3.1,
  ttf: 286,
  RWS: 19.23,
  totalStrafingShots: null,
  goodStrafingShots: null,
} as const

const min1 = (a: number) => Math.max(1, a)

const mapData: Record<
  Stat,
  (match: Record<keyof typeof sample, number>) => number
> = {
  ADR: (match) => match.ADR,
  'K/D': (match) => match.Kills / min1(match.Deaths),
  KANA_RATING: (match) => match.kanaRating,
  HEADSHOT_PERCENTAGE: (match) => match.hsPercent,
  FIRST_KILLS: (match) => match.firstKills,
  FIRST_DEATHS: (match) => match.firstDeaths,
  AWP_KILLS: (match) => match.AWPKills,

  CT_KILLS: (match) => match.Kills_CT,
  CT_DEATHS: (match) => match.Deaths_CT,
  'CT_K/D': (match) => match.Kills_CT / min1(match.Deaths_CT),

  T_KILLS: (match) => match.Kills_T,
  T_DEATHS: (match) => match.Deaths_T,
  'T_K/D': (match) => match.Kills_T / min1(match.Deaths_T),

  '1_VS_1_WON': (match) => match.oneVoneWon,
  '1_VS_1_LOST': (match) => match.oneVoneLost,

  CLUTCHES_WON: (match) => match.clutchesWon,
  ENEMIES_FLASHED: (match) => match.enemiesFlashed,
  ENEMIES_FLASHED_PER_FLASH: (match) =>
    match.enemiesFlashed / min1(match.flashesThrown),
  ENEMIES_FLASHED_DURATION: (match) => match.totalEFDuration,

  MATES_FLASHED: (match) => match.matesFlashed,
  MATES_FLASHED_PER_FLASH: (match) =>
    match.matesFlashed / min1(match.flashesThrown),
  MATES_FLASHED_DURATION: (match) => match.totalMFDuration,

  SELF_FLASHED: (match) => match.selfFlashes,
  SELF_FLASHED_PER_FLASH: (match) =>
    match.selfFlashes / min1(match.flashesThrown),
  UTILITY_DAMAGE: (match) => match.utilityDamage,
  FLASH_ASSISTS: (match) => match.flashAssists,
  FLASH_ASSISTS_PER_FLASH: (match) =>
    match.flashAssists / min1(match.flashesThrown),
}

const keys = Object.keys(sample)

const acc: Record<Stat, number[]> = {} as Record<Stat, number[]>

for (const k of stats) {
  acc[k] = []
}

for (const id of playerIds) {
  const matches = data.matches[id]?.data
  if (!matches || matches.length === 0) continue

  players++

  for (const match of matches) {
    for (const key of stats) {
      const value = mapData[key](match)

      if (value === null) {
        console.log(key)
      }

      acc[key].push(value)
    }
  }
}

for (const key of stats) {
  acc[key].sort((a, b) => a - b)
}

fs.writeFileSync('data.json', JSON.stringify(acc))

/*

for (const key of keys) {

  acc[key].sort((a,b)=>a-b)


  console.log(`${key}:`, acc[key][Math.floor(acc[key].length / 2)])

}
*/
