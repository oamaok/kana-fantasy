import fetch from 'node-fetch'

const BASE_URL = 'https://cssapi.kanalan.it/'
const TOKEN = '?token=asdf1'

export type League = {
  id: number
  name: string
  season: number
  taso: number
}

export type Team = {
  id: number
  name: string
  leagueID: number
  logo: string
}

export type Player = {
  id: number
  steamID: string
  name: string
  teamId: number
  formOK: number | null
}

type ApiResponse<Data> = {
  status: string
  data: Data
}

export const getLeagues = (seasonId: string) =>
  fetch(`${BASE_URL}leagues/${seasonId}${TOKEN}`).then(
    (res) => res.json() as Promise<ApiResponse<League[]>>
  )

export const getTeams = (leagueId: string) =>
  fetch(`${BASE_URL}teams/${leagueId}${TOKEN}`).then(
    (res) => res.json() as Promise<ApiResponse<Team[]>>
  )
export const getPlayers = (teamId: string) =>
  fetch(`${BASE_URL}team/${teamId}${TOKEN}`).then(
    (res) => res.json() as Promise<ApiResponse<Player[]>>
  )
export const getPlayerStats = (steamId: string) =>
  fetch(`${BASE_URL}players/${steamId}/s8${TOKEN}`).then(
    (res) => res.json() as Promise<ApiResponse<any[]>>
  )
