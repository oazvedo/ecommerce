import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { OrderStatusBadge } from './OrderStatusBadge'
import type { PedidoStatus } from '@/types'

describe('OrderStatusBadge', () => {
  it('renders the label for a known status', () => {
    render(<OrderStatusBadge status="EmProcessamento" />)
    expect(screen.getByText('Em Processamento')).toBeInTheDocument()
  })

  it('falls back to the raw status when unknown', () => {
    render(<OrderStatusBadge status={'Inexistente' as PedidoStatus} />)
    expect(screen.getByText('Inexistente')).toBeInTheDocument()
  })
})
