import { apiFetch } from './client'
import type { Usuario, PagedResult } from '@/types'

export const usuariosApi = {
  list: (page = 1, pageSize = 10) =>
    apiFetch<PagedResult<Usuario>>(`/usuario?page=${page}&pageSize=${pageSize}`),

  get: (id: string) => apiFetch<Usuario>(`/usuario/${id}`),

  create: (
    data: { nome: string; email: string; password: string; empresaId: string },
    cargo = 'Operador'
  ) =>
    apiFetch<Usuario>(`/usuario?cargo=${encodeURIComponent(cargo)}`, {
      method: 'POST',
      body: JSON.stringify(data),
      skipAuth: true,
    }),

  update: (id: string, data: { nome: string; email: string; cargo?: string }) =>
    apiFetch<void>(`/usuario/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  updatePassword: (id: string, password: string) =>
    apiFetch<void>(`/usuario/${id}/password`, {
      method: 'PUT',
      body: JSON.stringify({ password }),
    }),

  updateStatus: (id: string, status: 'Ativo' | 'Desativado') =>
    apiFetch<void>(`/usuario/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  delete: (id: string) =>
    apiFetch<void>(`/usuario/${id}`, { method: 'DELETE' }),
}
