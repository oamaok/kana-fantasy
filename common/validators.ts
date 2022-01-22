import * as t from 'io-ts'

export const Stat = t.union([
  t.literal('ADR'),
  t.literal('K/D'),
  t.literal('KANA_RATING'),
  t.literal('HEADSHOT_PERCENTAGE'),
  t.literal('FIRST_KILLS'),
  t.literal('FIRST_DEATHS'),
  t.literal('AWP_KILLS'),
  t.literal('CT_KILLS'),
  t.literal('CT_DEATHS'),
  t.literal('CT_K/D'),
  t.literal('T_KILLS'),
  t.literal('T_DEATHS'),
  t.literal('T_K/D'),
  t.literal('1_VS_1_WON'),
  t.literal('1_VS_1_LOST'),
  t.literal('CLUTCHES_WON'),
  t.literal('ENEMIES_FLASHED'),
  t.literal('ENEMIES_FLASHED_PER_FLASH'),
  t.literal('ENEMIES_FLASHED_DURATION'),
  t.literal('MATES_FLASHED'),
  t.literal('MATES_FLASHED_PER_FLASH'),
  t.literal('MATES_FLASHED_DURATION'),
  t.literal('SELF_FLASHED'),
  t.literal('SELF_FLASHED_PER_FLASH'),
  t.literal('UTILITY_DAMAGE'),
  t.literal('FLASH_ASSISTS'),
  t.literal('FLASH_ASSISTS_PER_FLASH'),
])

export type Stat = t.TypeOf<typeof Stat>

export const AuthRequest = t.type({
  code: t.string,
})

export type AuthRequest = t.TypeOf<typeof AuthRequest>

export const StatTarget = t.type({
  stat: Stat,
  inverted: t.boolean,
  target: t.number,
  margin: t.number,
})

export type StatTarget = t.TypeOf<typeof StatTarget>

export const PlayerRole = t.type({
  id: t.union([t.number, t.null]),
  name: t.string,
  description: t.string,
  targets: t.array(StatTarget),
})

export type PlayerRole = t.TypeOf<typeof PlayerRole>

export const RoleUpdateRequest = t.array(PlayerRole)

export type RoleUpdateRequest = t.TypeOf<typeof RoleUpdateRequest>

export const TeamPlayer = t.type({
  steamId: t.string,
  role: t.union([t.number, t.null]),
})

export type TeamPlayer = t.TypeOf<typeof TeamPlayer>

export const Team = t.type({
  name: t.string,
  division: t.string,
  season: t.number,
  players: t.array(TeamPlayer),
})

export type Team = t.TypeOf<typeof Team>

export const Season = t.type({
  id: t.union([t.null, t.number]),
  name: t.string,
  startDate: t.string,
  endDate: t.string,
  lockDate: t.string,
})

export type Season = t.TypeOf<typeof Season>

export const SeasonUpdateRequest = t.array(Season)

export type SeasonUpdateRequest = t.TypeOf<typeof SeasonUpdateRequest>
