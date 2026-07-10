import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { authApi } from '@/api/auth'
import { usuariosApi } from '@/api/usuarios'
import { setAccessToken, configureClient } from '@/api/client'
import type { JwtPayload, Usuario } from '@/types'

function decodeJwt(token: string): JwtPayload {
  const payload = token.split('.')[1]
  return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as JwtPayload
}

interface AuthContextValue {
  user: JwtPayload | null
  usuario: Usuario | null
  isAuthenticated: boolean
  isLoading: boolean
  hasPermission: (perm: string) => boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)
const REFRESH_KEY = 'refresh_token'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<JwtPayload | null>(null)
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const clearSession = useCallback(() => {
    setAccessToken(null)
    localStorage.removeItem(REFRESH_KEY)
    setUser(null)
    setUsuario(null)
  }, [])

  const handleTokens = useCallback(
    async (access: string, refresh: string) => {
      setAccessToken(access)
      localStorage.setItem(REFRESH_KEY, refresh)
      const decoded = decodeJwt(access)
      setUser(decoded)
      try {
        const profile = await usuariosApi.get(decoded.sub)
        setUsuario(profile)
      } catch {
        // profile fetch is best-effort
      }
    },
    []
  )

  const doRefresh = useCallback(async (): Promise<string> => {
    const rt = localStorage.getItem(REFRESH_KEY)
    if (!rt) throw new Error('no refresh token')
    const tokens = await authApi.refresh(rt)
    await handleTokens(tokens.access_token, tokens.refresh_token)
    return tokens.access_token
  }, [handleTokens])

  useEffect(() => {
    configureClient({ onRefresh: doRefresh, onSessionExpired: clearSession })
  }, [doRefresh, clearSession])

  useEffect(() => {
    const rt = localStorage.getItem(REFRESH_KEY)
    if (rt) {
      doRefresh()
        .catch(clearSession)
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(
    async (email: string, password: string) => {
      const tokens = await authApi.login(email, password)
      await handleTokens(tokens.access_token, tokens.refresh_token)
    },
    [handleTokens]
  )

  const logout = useCallback(async () => {
    const rt = localStorage.getItem(REFRESH_KEY)
    if (rt) await authApi.revoke(rt).catch(() => {})
    clearSession()
  }, [clearSession])

  const hasPermission = useCallback(
    (perm: string) => {
      if (!user) return false
      const perms = Array.isArray(user.Permission) ? user.Permission : [user.Permission]
      return perms.includes(perm)
    },
    [user]
  )

  return (
    <AuthContext.Provider
      value={{ user, usuario, isAuthenticated: !!user, isLoading, hasPermission, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
