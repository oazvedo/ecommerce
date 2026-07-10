import { apiFetch } from './client'
import type { Pedido, PagedResult, PedidoStatus, PedidoContratacao, RelatorioVendas } from '@/types'

export const pedidosApi = {
  list: (params?: {
    page?: number
    pageSize?: number
    status?: PedidoStatus
    contratacao?: PedidoContratacao
    usuarioId?: string
  }) => {
    const q = new URLSearchParams()
    if (params?.page) q.set('page', String(params.page))
    if (params?.pageSize) q.set('pageSize', String(params.pageSize))
    if (params?.status) q.set('status', params.status)
    if (params?.contratacao) q.set('contratacao', params.contratacao)
    if (params?.usuarioId) q.set('usuarioId', params.usuarioId)
    return apiFetch<PagedResult<Pedido>>(`/pedido?${q}`)
  },

  meus: (page = 1, pageSize = 10) =>
    apiFetch<PagedResult<Pedido>>(`/pedido/meus?page=${page}&pageSize=${pageSize}`),

  get: (id: string) => apiFetch<Pedido>(`/pedido/${id}`),

  create: (data: {
    empresa_id: string
    contratacao: PedidoContratacao
    itens: { produto_id: string; quantidade: number }[]
  }) => apiFetch<Pedido>('/pedido', { method: 'POST', body: JSON.stringify(data) }),

  updateStatus: (id: string, status: PedidoStatus) =>
    apiFetch<Pedido>(`/pedido/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  cancelar: (id: string) =>
    apiFetch<Pedido>(`/pedido/cancelar?id=${id}`, { method: 'POST', skipAuth: true }),

  relatorio: (data_inicio: string, data_fim: string) =>
    apiFetch<RelatorioVendas>(
      `/pedido/relatorio?data_inicio=${data_inicio}&data_fim=${data_fim}`
    ),
}
