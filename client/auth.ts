import * as api from './api'
import { navigateTo } from './router'
import { state } from './state'

export const handleOAuth = async () => {
  const code = new URL(location.href).searchParams.get('code')
  if (!code) {
    navigateTo('/')
    return
  }

  const { token, user } = await api.authRequest(code)

  state.auth = {
    type: 'authenticated',
    user,
  }

  localStorage.setItem('kanafantasy_token', token)
  navigateTo('/')
}

export type User = {
  id: string
  avatar: string
  username: string
}

export type AuthState =
  | {
      type: 'unauthenticated'
    }
  | {
      type: 'loading'
    }
  | {
      type: 'error'
    }
  | {
      type: 'authenticated'
      user: User
    }

export const getInitialAuthState = (): AuthState => {
  const token = localStorage.getItem('kanafantasy_token')
  if (!token) {
    return { type: 'unauthenticated' }
  }

  return { type: 'loading' }
}

export const inititializeAuth = async () => {
  const token = localStorage.getItem('kanafantasy_token')
  if (!token) {
    return
  }

  const { user } = await api.authVerify()

  if (user) {
    state.auth = {
      type: 'authenticated',
      user,
    }
  } else {
    localStorage.removeItem('kanafantasy_token')
    state.auth = {
      type: 'unauthenticated',
    }
  }
}

export const logout = () => {
  api.authRevoke()
  localStorage.removeItem('kanafantasy_token')
  state.auth = {
    type: 'unauthenticated',
  }
}
