import { apiFetch } from './client'
import type { ProdutoPayload } from './produtos'
import type { Empresa, Loja, PagedResult, Produto, Usuario } from '@/types'

export const empresasApi = {
  list: (page = 1, pageSize = 10) =>
    apiFetch<PagedResult<Empresa>>(`/empresa?page=${page}&pageSize=${pageSize}`),

  get: (id: string) => apiFetch<Empresa>(`/empresa/${id}`),

  // Vitrine pública da loja — acessível a clientes (não exige Empresa.Read).
  getVitrine: (id: string) => apiFetch<Loja>(`/empresa/${id}/vitrine`),

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
      empresa_pai_id?: string | null
    }
  ) =>
    apiFetch<Empresa>(`/empresa/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<void>(`/empresa/${id}`, { method: 'DELETE' }),

  // Filiais diretas de uma central (hierarquia de 1 nível).
  getFiliais: (id: string, page = 1, pageSize = 20) =>
    apiFetch<PagedResult<Empresa>>(`/empresa/${id}/filiais?page=${page}&pageSize=${pageSize}`),

  // Cria uma filial vinculada à central paiId (exige Empresa.Update + escopo).
  createFilial: (
    paiId: string,
    data: { nome: string; cnpj: string; telefone: string; status: boolean }
  ) =>
    apiFetch<Empresa>(`/empresa/${paiId}/filial`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getProdutos: (id: string, page = 1, pageSize = 20) =>
    apiFetch<PagedResult<Produto>>(`/empresa/${id}/produtos?page=${page}&pageSize=${pageSize}`),

  // Cria um produto dentro da empresa (própria ou filial no escopo) — a loja
  // vendedora é a empresa da rota, não a do usuário logado.
  criarProduto: (empresaId: string, data: ProdutoPayload) =>
    apiFetch<Produto>(`/empresa/${empresaId}/produto`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getUsuarios: (id: string, page = 1, pageSize = 50) =>
    apiFetch<PagedResult<Usuario>>(`/empresa/${id}/usuarios?page=${page}&pageSize=${pageSize}`),

  // Cria um usuário dentro da empresa (própria ou filial no escopo).
  criarUsuario: (
    empresaId: string,
    data: { nome: string; email: string; password: string; cargo: string }
  ) =>
    apiFetch<Usuario>(`/empresa/${empresaId}/usuario`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  adicionarUsuario: (empresaId: string, usuarioId: string) =>
    apiFetch<void>(`/empresa/${empresaId}/usuario/${usuarioId}`, { method: 'PATCH' }),

  desalocarUsuario: (empresaId: string, usuarioId: string) =>
    apiFetch<void>(`/empresa/${empresaId}/usuario/${usuarioId}`, { method: 'DELETE' }),
}
