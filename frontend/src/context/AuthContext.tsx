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

export type Role = 'admin' | 'lojista' | 'cliente'

interface AuthContextValue {
  user: JwtPayload | null
  usuario: Usuario | null
  isAuthenticated: boolean
  isLoading: boolean
  isAdmin: boolean
  isLojista: boolean
  role: Role
  cargo: string | null
  empresaId: string | null
  hasPermission: (perm: string) => boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: { nome: string; email: string; password: string }) => Promise<void>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
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

  const register = useCallback(
    async (data: { nome: string; email: string; password: string }) => {
      await usuariosApi.register(data)
      await login(data.email, data.password)
    },
    [login]
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

  const isAdmin = user?.Cargo === 'Administrador'
  // Lojista = pode gerir produtos da própria loja (dono/gestor de empresa vendedora).
  // Cliente = qualquer usuário logado que só compra.
  const isLojista = !isAdmin && hasPermission('Produto.Create')
  const role: Role = isAdmin ? 'admin' : isLojista ? 'lojista' : 'cliente'
  const cargo = user?.Cargo ?? null
  const empresaId = user?.EmpresaId ?? null

  return (
    <AuthContext.Provider
      value={{ user, usuario, isAuthenticated: !!user, isLoading, isAdmin, isLojista, role, cargo, empresaId, hasPermission, login, register, logout, refreshSession: async () => { await doRefresh() } }}
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
