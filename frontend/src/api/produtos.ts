import { apiFetch } from './client'
import type { Produto, PagedResult } from '@/types'

export interface ProdutoPayload {
  nome: string
  descricao: string
  preco: number
  codigo: string
  status: boolean
}

export const produtosApi = {
  list: (page = 1, pageSize = 12) =>
    apiFetch<PagedResult<Produto>>(`/produto?page=${page}&pageSize=${pageSize}`),

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
