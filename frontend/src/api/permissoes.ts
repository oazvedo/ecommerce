import { apiFetch } from './client'
import type { Permissao, PagedResult } from '@/types'

export const permissoesApi = {
  list: (page = 1, pageSize = 100) =>
    apiFetch<PagedResult<Permissao>>(`/permissao?page=${page}&pageSize=${pageSize}`),

  byUsuario: (usuarioId: string) =>
    apiFetch<Permissao[]>(`/permissao/usuario/${usuarioId}`),

  assign: (usuarioId: string, permissaoId: string) =>
    apiFetch<void>(`/permissao/usuario/${usuarioId}/${permissaoId}`, {
      method: 'POST',
    }),

  remove: (usuarioId: string, permissaoId: string) =>
    apiFetch<void>(`/permissao/usuario/${usuarioId}/${permissaoId}`, {
      method: 'DELETE',
    }),

  removeAll: (usuarioId: string) =>
    apiFetch<void>(`/permissao/usuario/${usuarioId}`, { method: 'DELETE' }),
}
