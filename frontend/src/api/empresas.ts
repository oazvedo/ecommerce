import { apiFetch } from './client'
import type { Empresa, PagedResult } from '@/types'

export const empresasApi = {
  list: (page = 1, pageSize = 10) =>
    apiFetch<PagedResult<Empresa>>(`/empresa?page=${page}&pageSize=${pageSize}`),

  get: (id: string) => apiFetch<Empresa>(`/empresa/${id}`),

  create: (data: {
    nome: string
    cnpj: string
    telefone: string
    tipo: string
    status: boolean
  }) =>
    apiFetch<Empresa>('/empresa', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (
    id: string,
    data: {
      nome: string
      cnpj: string
      responsavel?: string
      responsavel_id?: string
      telefone: string
      tipo: string
      status: boolean
    }
  ) =>
    apiFetch<Empresa>(`/empresa/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<void>(`/empresa/${id}`, { method: 'DELETE' }),
}
