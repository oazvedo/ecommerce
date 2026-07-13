import { apiFetch } from './client'
import type { Pedido, PagedResult, PedidoStatus, PedidoContratacao, RelatorioVendas } from '@/types'

type PedidoItemApi = Partial<Pedido['itens'][number]> & {
  produtoId?: string
  produto_id?: string
  nomeProduto?: string
  nome_produto?: string
  quantidade?: number
  precoUnitario?: number
  preco_unitario?: number
  subtotal?: number
}

type PedidoApi = Partial<Pedido> & {
  contracacao?: PedidoContratacao
  valorTotal?: number
  empresaId?: string
  empresaNome?: string
  empresaCNPJ?: string
  empresaCnpj?: string
  usuarioId?: string
  criadoEm?: string
  atualizadoEm?: string | null
  itens?: PedidoItemApi[]
}

function normalizePedidoItem(item: PedidoItemApi): Pedido['itens'][number] {
  return {
    ProdutoId: item.ProdutoId ?? item.produtoId ?? item.produto_id ?? '',
    NomeProduto: item.NomeProduto ?? item.nomeProduto ?? item.nome_produto ?? '',
    Quantidade: item.Quantidade ?? item.quantidade ?? 0,
    PrecoUnitario: item.PrecoUnitario ?? item.precoUnitario ?? item.preco_unitario ?? 0,
    Subtotal: item.Subtotal ?? item.subtotal ?? 0,
  }
}

function normalizePedido(pedido: PedidoApi): Pedido {
  return {
    id: pedido.id ?? '',
    status: (pedido.status ?? 'Criado') as PedidoStatus,
    contratacao: (pedido.contratacao ?? pedido.contracacao ?? 'Mensal') as PedidoContratacao,
    valor_total: pedido.valor_total ?? pedido.valorTotal ?? 0,
    empresa_id: pedido.empresa_id ?? pedido.empresaId ?? '',
    empresa_nome: pedido.empresa_nome ?? pedido.empresaNome ?? '',
    empresa_cnpj: pedido.empresa_cnpj ?? pedido.empresaCNPJ ?? pedido.empresaCnpj ?? '',
    usuario_id: pedido.usuario_id ?? pedido.usuarioId ?? '',
    usuario_nome: pedido.usuario_nome ?? '',
    itens: (pedido.itens ?? []).map(normalizePedidoItem),
    criado_em: pedido.criado_em ?? pedido.criadoEm ?? '',
    atualizado_em: pedido.atualizado_em ?? pedido.atualizadoEm ?? null,
  }
}

function normalizePedidoPage(result: PagedResult<PedidoApi>): PagedResult<Pedido> {
  return {
    ...result,
    items: result.items.map(normalizePedido),
  }
}

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
    return apiFetch<PagedResult<PedidoApi>>(`/pedido?${q}`).then(normalizePedidoPage)
  },

  meus: (page = 1, pageSize = 10) =>
    apiFetch<PagedResult<PedidoApi>>(`/pedido/meus?page=${page}&pageSize=${pageSize}`).then(normalizePedidoPage),

  get: (id: string) => apiFetch<PedidoApi>(`/pedido/${id}`).then(normalizePedido),

  create: (data: {
    empresa_id: string
    contratacao: PedidoContratacao
    itens: { produto_id: string; quantidade: number }[]
  }) => apiFetch<PedidoApi>('/pedido', { method: 'POST', body: JSON.stringify(data) }).then(normalizePedido),

  updateStatus: (id: string, status: PedidoStatus) =>
    apiFetch<PedidoApi>(`/pedido/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }).then(normalizePedido),

  delete: (id: string) =>
    apiFetch<void>(`/pedido/${id}`, { method: 'DELETE' }),

  cancelar: (id: string) =>
    apiFetch<PedidoApi>(`/pedido/cancelar?id=${id}`, { method: 'POST', skipAuth: true }).then(normalizePedido),

  relatorio: (data_inicio: string, data_fim: string) =>
    apiFetch<RelatorioVendas>(
      `/pedido/relatorio?data_inicio=${data_inicio}&data_fim=${data_fim}`
    ),
}
