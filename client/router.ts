import { state } from './state'

const routes = [
  {
    name: 'index',
    match: /^\/$/,
  },
  {
    name: 'oauthCallback',
    match: /^\/oauth$/,
  },
  {
    name: 'admin',
    match: /^\/admin$/,
  },

  {
    name: 'notFound',
    match: /.*/,
  },
] as const

export const navigateTo = (path: string) => {
  history.pushState({}, '', path)
  state.route = parseRoute(location)
}

export const parseRoute = (location: Location) => {
  return routes.find((route) => location.pathname.match(route.match))!
}
