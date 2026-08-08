import { apiFetch } from './client'
import type { Avaliacao, AvaliacaoResumo, PagedResult } from '@/types'

export interface AvaliarPayload {
  produtoId?: string
  empresaId?: string
  nota: number
  comentario?: string | null
}

export const avaliacoesApi = {
  avaliar: (data: AvaliarPayload) =>
    apiFetch<Avaliacao>('/avaliacao', { method: 'POST', body: JSON.stringify(data) }),

  listByProduto: (produtoId: string, page = 1, pageSize = 10) =>
    apiFetch<PagedResult<Avaliacao>>(`/avaliacao/produto/${produtoId}?page=${page}&pageSize=${pageSize}`),

  resumoByProduto: (produtoId: string) =>
    apiFetch<AvaliacaoResumo>(`/avaliacao/produto/${produtoId}/resumo`),

  listByEmpresa: (empresaId: string, page = 1, pageSize = 10) =>
    apiFetch<PagedResult<Avaliacao>>(`/avaliacao/empresa/${empresaId}?page=${page}&pageSize=${pageSize}`),

  resumoByEmpresa: (empresaId: string) =>
    apiFetch<AvaliacaoResumo>(`/avaliacao/empresa/${empresaId}/resumo`),
}
