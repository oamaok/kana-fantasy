import {
  RoleDeleteRequest,
  RoleUpdateRequest,
  SeasonUpdateRequest,
  Team,
} from '../common/validators'
import { Player } from '../common/types'
import { state } from './state'

const apiRequest = (
  method: 'POST' | 'GET' | 'DELETE',
  endpoint: string,
  data?: any
) =>
  fetch(`/api/${endpoint}`, {
    method,
    headers: {
      'content-type': 'application/json',
      authorization: localStorage.getItem('kanafantasy_token') ?? '',
    },
    body: typeof data === 'undefined' ? undefined : JSON.stringify(data),
  }).then((res) => res.json())

export const authRequest = (code: string) =>
  apiRequest('POST', 'auth/request', { code })
export const authVerify = () => apiRequest('GET', 'auth/verify')
export const authRefresh = () => apiRequest('GET', 'auth/refresh')
export const authRevoke = () => apiRequest('GET', 'auth/revoke')

export const getPlayers = (
  season: number,
  division: string
): Promise<Player[]> =>
  apiRequest('GET', `seasons/${season}/${division}/players`)
export const getRoles = () => apiRequest('GET', 'roles')
export const getRolesWithTargets = () => apiRequest('GET', 'roles/with-targets')
export const saveRoles = (data: RoleUpdateRequest) =>
  apiRequest('POST', 'roles', data)
export const deleteRole = (data: RoleDeleteRequest) =>
  apiRequest('DELETE', 'roles', data)
export const buyTeam = (team: Team) => apiRequest('POST', 'team/buy', team)
export const getTeams = () => apiRequest('GET', 'teams')
export const getSeasons = () => apiRequest('GET', 'seasons')
export const saveSeasons = (seasons: SeasonUpdateRequest) =>
  apiRequest('POST', 'seasons', seasons)
