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

export type ProdutoOrderBy = 'preco_asc' | 'preco_desc' | 'nome_asc'

export interface ProdutoListFilters {
  empresaId?: string
  nome?: string
  disponivel?: boolean
  freteGratis?: boolean
  precoMin?: number
  precoMax?: number
  orderBy?: ProdutoOrderBy
}

export const produtosApi = {
  // empresaId filtra o catálogo pela loja vendedora (Fase 4 — catálogo por loja).
  // nome busca por nome/código; disponivel e freteGratis filtram por status/frete;
  // precoMin/precoMax filtram por faixa de preço; orderBy ordena o resultado.
  list: (page = 1, pageSize = 12, filters: ProdutoListFilters = {}) => {
    const q = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
    if (filters.empresaId) q.set('empresaId', filters.empresaId)
    if (filters.nome) q.set('nome', filters.nome)
    if (filters.disponivel !== undefined) q.set('disponivel', String(filters.disponivel))
    if (filters.freteGratis !== undefined) q.set('freteGratis', String(filters.freteGratis))
    if (filters.precoMin !== undefined) q.set('precoMin', String(filters.precoMin))
    if (filters.precoMax !== undefined) q.set('precoMax', String(filters.precoMax))
    if (filters.orderBy) q.set('orderBy', filters.orderBy)
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
