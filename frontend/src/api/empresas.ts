import { apiFetch } from './client'
import type { Empresa, PagedResult, Produto, Usuario } from '@/types'

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

  getProdutos: (id: string, page = 1, pageSize = 20) =>
    apiFetch<PagedResult<Produto>>(`/empresa/${id}/produtos?page=${page}&pageSize=${pageSize}`),

  getUsuarios: (id: string, page = 1, pageSize = 50) =>
    apiFetch<PagedResult<Usuario>>(`/empresa/${id}/usuarios?page=${page}&pageSize=${pageSize}`),

  adicionarUsuario: (empresaId: string, usuarioId: string) =>
    apiFetch<void>(`/empresa/${empresaId}/usuario/${usuarioId}`, { method: 'PATCH' }),

  desalocarUsuario: (empresaId: string, usuarioId: string) =>
    apiFetch<void>(`/empresa/${empresaId}/usuario/${usuarioId}`, { method: 'DELETE' }),
}
