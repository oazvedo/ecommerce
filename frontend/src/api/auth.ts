import { apiFetch } from './client'
import type { AuthTokens } from '@/types'

export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<AuthTokens>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    }),

  refresh: (refreshToken: string) =>
    apiFetch<AuthTokens>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
      skipAuth: true,
    }),

  revoke: (refreshToken: string) =>
    apiFetch<void>('/auth/revoke', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),
}
