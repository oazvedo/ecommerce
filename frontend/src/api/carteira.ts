import { apiFetch } from './client'
import type { Carteira, PagedResult } from '@/types'

export const carteiraApi = {
  list: (page = 1, pageSize = 10) =>
    apiFetch<PagedResult<Carteira>>(`/carteira?page=${page}&pageSize=${pageSize}`),

  get: (id: string) => apiFetch<Carteira>(`/carteira/${id}`),

  minha: () => apiFetch<Carteira>('/carteira/minha-carteira'),

  update: (id: string, saldo: number, cupom?: string) =>
    apiFetch<Carteira>(`/carteira/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ saldo, ...(cupom ? { cupom } : {}) }),
    }),

  updateMinha: (saldo: number, cupom?: string) =>
    apiFetch<Carteira>('/carteira/update-my-balance', {
      method: 'PUT',
      body: JSON.stringify({ saldo, ...(cupom ? { cupom } : {}) }),
    }),

  delete: (id: string) =>
    apiFetch<void>(`/carteira/${id}`, { method: 'DELETE' }),
}
