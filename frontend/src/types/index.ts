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
  cargo: 'Operador' | 'Administrador' | 'Gerente' | 'Diretor'
  empresa_id: string
  foto_url: string | null
  criado_em: string
  atualizado_em: string | null
}

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
  empresa_criado_em: string
  empresa_atualizado_em: string | null
}

export interface Permissao {
  id: string
  nome: string
  descricao: string
}
