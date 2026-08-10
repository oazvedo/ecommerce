import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ProdutoFormDialog } from './ProdutoFormDialog'
import type { Produto } from '@/types'

vi.mock('@/api/categorias', () => ({
  categoriasApi: { list: vi.fn().mockResolvedValue({ items: [] }) },
}))

// O upload de imagem depende de rede/FileReader e nao faz parte do que se testa aqui.
vi.mock('@/components/ImageUpload', () => ({ ImageUpload: () => null }))

const PRODUTO: Produto = {
  id: 'p1',
  nome: 'Plano Premium',
  descricao: 'Assinatura',
  codigo: 'PLAN-001',
  status: true,
  preco: 99.9,
  imagemUrl: null,
  empresaId: 'e1',
  criadoEm: '2026-01-01T00:00:00Z',
  atualizadoEm: null,
  estoque: 0,
  freteGratis: false,
  variantes: null,
  categoriaId: null,
  categoriaNome: null,
  notaMedia: 0,
  totalAvaliacoes: 0,
  tipo: 'Servico',
  contratacaoPermitida: 'Anual',
  maxParcelas: 12,
}

function renderDialog(produto: Produto | null) {
  const onCreate = vi.fn().mockResolvedValue(PRODUTO)
  const onUpdate = vi.fn().mockResolvedValue(PRODUTO)
  render(
    <ProdutoFormDialog
      open
      onOpenChange={() => {}}
      produto={produto}
      onCreate={onCreate}
      onUpdate={onUpdate}
      onSaved={() => {}}
    />
  )
  return { onCreate, onUpdate }
}

describe('ProdutoFormDialog', () => {
  beforeEach(() => vi.clearAllMocks())

  it('envia produto novo como fisico, sem restricao de contratacao e a vista', async () => {
    const user = userEvent.setup()
    const { onCreate } = renderDialog(null)

    await user.type(screen.getByLabelText('Nome'), 'Cafeteira')
    await user.type(screen.getByLabelText('Código'), 'CAF-1')
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() => expect(onCreate).toHaveBeenCalledTimes(1))
    expect(onCreate.mock.calls[0][0]).toMatchObject({
      tipo: 'Fisico',
      contratacaoPermitida: 'Ambas',
      maxParcelas: 1,
    })
  })

  it('esconde a contratacao em produto fisico', () => {
    renderDialog({ ...PRODUTO, tipo: 'Fisico' })
    expect(screen.queryByText('Contratação permitida')).not.toBeInTheDocument()
  })

  it('mostra a contratacao em produto de servico', () => {
    renderDialog(PRODUTO)
    expect(screen.getByText('Contratação permitida')).toBeInTheDocument()
  })

  it('limita o maximo de parcelas ao teto da plataforma', async () => {
    const user = userEvent.setup()
    const { onUpdate } = renderDialog(PRODUTO)

    const parcelas = screen.getByLabelText('Máx. parcelas')
    await user.clear(parcelas)
    await user.type(parcelas, '99')
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() => expect(onUpdate).toHaveBeenCalledTimes(1))
    expect(onUpdate.mock.calls[0][1]).toMatchObject({ maxParcelas: 24 })
  })

  it('mantem a configuracao ao editar um produto existente', async () => {
    const user = userEvent.setup()
    const { onUpdate } = renderDialog(PRODUTO)

    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    await waitFor(() => expect(onUpdate).toHaveBeenCalledTimes(1))
    expect(onUpdate.mock.calls[0][1]).toMatchObject({
      tipo: 'Servico',
      contratacaoPermitida: 'Anual',
      maxParcelas: 12,
    })
  })
})
