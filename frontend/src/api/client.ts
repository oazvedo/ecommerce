const BASE_URL = 'http://localhost:5103/api'

let _accessToken: string | null = null
let _onRefresh: (() => Promise<string>) | null = null
let _onSessionExpired: (() => void) | null = null
let _refreshPromise: Promise<string> | null = null

export function setAccessToken(token: string | null) {
  _accessToken = token
}

export function getAuthHeader(): Record<string, string> {
  return _accessToken ? { Authorization: `Bearer ${_accessToken}` } : {}
}

export function configureClient(opts: {
  onRefresh: () => Promise<string>
  onSessionExpired: () => void
}) {
  _onRefresh = opts.onRefresh
  _onSessionExpired = opts.onSessionExpired
}

export class ApiError extends Error {
  readonly status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { skipAuth?: boolean } = {}
): Promise<T> {
  const { skipAuth, ...fetchOptions } = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  }

  if (!skipAuth && _accessToken) {
    headers['Authorization'] = `Bearer ${_accessToken}`
  }

  let res = await fetch(`${BASE_URL}${path}`, { ...fetchOptions, headers })

  if (res.status === 401 && !skipAuth && _onRefresh) {
    try {
      if (!_refreshPromise) {
        _refreshPromise = _onRefresh().finally(() => {
          _refreshPromise = null
        })
      }
      const newToken = await _refreshPromise
      headers['Authorization'] = `Bearer ${newToken}`
      res = await fetch(`${BASE_URL}${path}`, { ...fetchOptions, headers })
    } catch {
      _onSessionExpired?.()
      throw new ApiError(401, 'Sessão expirada. Faça login novamente.')
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError(res.status, (body as { mensagem?: string }).mensagem ?? 'Erro desconhecido')
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}
