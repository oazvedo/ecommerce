import { apiFetch } from './client'
import type { CategoriaProduto, PagedResult } from '@/types'

export interface CategoriaProdutoPayload {
  nome: string
  ativo: boolean
}

export const categoriasApi = {
  list: (page = 1, pageSize = 50, ativo?: boolean) => {
    const q = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
    if (ativo !== undefined) q.set('ativo', String(ativo))
    return apiFetch<PagedResult<CategoriaProduto>>(`/categoriaproduto?${q}`)
  },

  get: (id: string) => apiFetch<CategoriaProduto>(`/categoriaproduto/${id}`),

  create: (nome: string) =>
    apiFetch<CategoriaProduto>('/categoriaproduto', { method: 'POST', body: JSON.stringify({ nome }) }),

  update: (id: string, data: CategoriaProdutoPayload) =>
    apiFetch<CategoriaProduto>(`/categoriaproduto/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string) =>
    apiFetch<void>(`/categoriaproduto/${id}`, { method: 'DELETE' }),
}
