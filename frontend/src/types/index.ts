export interface PagedResult<T> {
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
  items: T[]
}

export interface Usuario {
  id: string
  nome: string
  email: string
  status: 'Ativo' | 'Desativado'
  cargo: 'Operador' | 'Administrador' | 'Gerente' | 'Diretor' | 'Cliente'
  empresa_id: string
  foto_url: string | null
  criado_em: string
  atualizado_em: string | null
}

/** Fisico = bem entregue uma vez; Servico = assinatura/recorrente. */
export type ProdutoTipo = 'Fisico' | 'Servico'

/** Contratacoes que a loja aceita para o produto. */
export type ProdutoContratacaoPermitida = 'Mensal' | 'Anual' | 'Ambas'

/** Teto de parcelas aceito pela plataforma (espelha Produto.MaxParcelasLimite na API). */
export const MAX_PARCELAS_LIMITE = 24

export interface Produto {
  id: string
  nome: string
  descricao: string
  codigo: string
  status: boolean
  preco: number
  imagemUrl: string | null
  empresaId: string
  criadoEm: string
  atualizadoEm: string | null
  estoque: number
  freteGratis: boolean
  variantes: string | null
  categoriaId: string | null
  categoriaNome: string | null
  notaMedia: number
  totalAvaliacoes: number
  tipo: ProdutoTipo
  contratacaoPermitida: ProdutoContratacaoPermitida
  /** 0 ou 1 = somente a vista. */
  maxParcelas: number
}

export interface CategoriaProduto {
  id: string
  nome: string
  ativo: boolean
  criadoEm: string
}

export interface Avaliacao {
  id: string
  produtoId: string | null
  empresaId: string | null
  usuarioId: string
  usuarioNome: string
  nota: number
  comentario: string | null
  criadoEm: string
  atualizadoEm: string | null
}

export interface AvaliacaoResumo {
  media: number
  total: number
}

export interface PedidoItem {
  ProdutoId: string
  NomeProduto: string
  Quantidade: number
  PrecoUnitario: number
  Subtotal: number
}

export type PedidoStatus = 'Cancelado' | 'Criado' | 'EmProcessamento' | 'Suporte' | 'Finalizado'
export type PedidoContratacao = 'Mensal' | 'Anual'

export type FormaPagamento = 'Carteira' | 'Parcelado'

export interface Pedido {
  id: string
  status: PedidoStatus
  contratacao: PedidoContratacao
  forma_pagamento: FormaPagamento
  parcelas: number | null
  valor_total: number
  empresa_id: string
  empresa_nome: string
  empresa_cnpj: string
  usuario_id: string
  usuario_nome: string
  itens: PedidoItem[]
  criado_em: string
  atualizado_em: string | null
}

export interface Carteira {
  id: string
  usuario_id: string
  usuario_nome: string
  usuario_email: string
  saldo: number
  criado_em: string
  atualizado_em: string | null
}

export type CarteiraTransacaoTipo = 'Recarga' | 'Debito' | 'Reembolso' | 'Parcela'

export interface CarteiraTransacao {
  id: string
  tipo: CarteiraTransacaoTipo
  valor: number
  descricao: string | null
  referencia_id: string | null
  ocorrido_em: string
}

export interface PixRecargaResponse {
  pix_recarga_id: string
  br_code: string
  br_code_base64: string
  valor: number
  criado_em: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface JwtPayload {
  sub: string
  email: string
  unique_name: string
  Permission: string | string[]
  Cargo: string
  EmpresaId: string
  exp: number
  iat: number
}

export interface CartItem {
  produto: Produto
  quantidade: number
}

export interface RelatorioVendas {
  produto_mais_vendido: string
  total_de_vendas: number
  total_de_valor_vendas: number
  maior_valor_de_venda: number
  cliente_mais_frequente: string
  tipo_de_contratacao_mais_utilizado: string
}

export interface Empresa {
  empresa_id: string
  empresa_nome: string
  empresa_cnpj: string
  empresa_responsavel: string
  empresa_responsavel_id: string
  empresa_telefone: string
  empresa_tipo: string
  empresa_status: boolean
  empresa_logo_url: string | null
  empresa_pai_id: string | null
  empresa_criado_em: string
  empresa_atualizado_em: string | null
}

export interface Permissao {
  id: string
  nome: string
  descricao: string
}

/** Dados públicos de uma loja (vitrine do marketplace). */
export interface Loja {
  empresa_id: string
  empresa_nome: string
  empresa_tipo: string
  empresa_logo_url: string | null
}
