import { RoleUpdateRequest, Team } from '../common/validators'
import { IPlayer } from '../common/interfaces'
import { state } from './state'

const apiRequest = (method: 'POST' | 'GET', endpoint: string, data?: any) =>
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

export const getPlayers = (division: string): Promise<IPlayer[]> =>
  apiRequest('GET', 'players/' + division)
export const getRoles = () => apiRequest('GET', 'roles')
export const getFullRoles = () => apiRequest('GET', 'full-roles')
export const saveRoles = (data: RoleUpdateRequest) =>
  apiRequest('POST', 'roles', data)
export const saveTeam = (team: Team) => apiRequest('POST', 'team', team)