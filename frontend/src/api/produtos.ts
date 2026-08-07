import { apiFetch } from './client'
import type { Produto, PagedResult } from '@/types'

export interface ProdutoPayload {
  nome: string
  descricao: string
  preco: number
  codigo: string
  status: boolean
  estoque: number
  freteGratis: boolean
  variantes: string | null
}

export const produtosApi = {
  // empresaId filtra o catálogo pela loja vendedora (Fase 4 — catálogo por loja).
  list: (page = 1, pageSize = 12, empresaId?: string) => {
    const q = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
    if (empresaId) q.set('empresaId', empresaId)
    return apiFetch<PagedResult<Produto>>(`/produto?${q}`)
  },

  listAll: (page = 1, pageSize = 20) =>
    apiFetch<PagedResult<Produto>>(`/produto?page=${page}&pageSize=${pageSize}`),

  get: (id: string) => apiFetch<Produto>(`/produto/${id}`),

  create: (data: ProdutoPayload) =>
    apiFetch<Produto>('/produto', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: ProdutoPayload) =>
    apiFetch<Produto>(`/produto/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string) =>
    apiFetch<void>(`/produto/${id}`, { method: 'DELETE' }),
}
