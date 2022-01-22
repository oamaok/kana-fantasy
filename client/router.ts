import { state } from './state'
import { Path } from 'path-parser'

const routes = [
  {
    name: 'index',
    match: '/',
  },
  {
    name: 'team-builder',
    match: '/team-builder/:season',
  },
  {
    name: 'oauth-callback',
    match: '/oauth',
  },
  {
    name: 'admin',
    match: '/admin',
  },
] as const

export const navigateTo = (path: string) => {
  history.pushState({}, '', path)
  state.route = matchRoute(location)
}

export const matchRoute = (location: Location) => {
  for (const route of routes) {
    const match = new Path(route.match).test(location.pathname)
    if (match) {
      return {
        ...route,
        params: match,
      }
    }
  }
  return null
}
