import { apiFetch } from './client'
import type { PagedResult, Produto } from '@/types'

export const favoritosApi = {
  adicionar: (produtoId: string) =>
    apiFetch<void>(`/favorito/${produtoId}`, { method: 'POST' }),

  remover: (produtoId: string) =>
    apiFetch<void>(`/favorito/${produtoId}`, { method: 'DELETE' }),

  status: (produtoId: string) =>
    apiFetch<{ favoritado: boolean }>(`/favorito/${produtoId}/status`),

  ids: () => apiFetch<string[]>('/favorito/ids'),

  list: (page = 1, pageSize = 20) =>
    apiFetch<PagedResult<Produto>>(`/favorito?page=${page}&pageSize=${pageSize}`),
}
