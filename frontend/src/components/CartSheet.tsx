import { ArrowRight, Minus, Package, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useCart } from '@/context/CartContext'

export function CartSheet() {
  const { items, total, totalItems, updateQuantity, removeItem } = useCart()
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <div className="flex min-h-96 flex-1 flex-col items-center justify-center gap-4 px-6 text-center text-muted-foreground">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <div>
          <p className="font-semibold text-foreground">Seu carrinho está vazio</p>
          <p className="mt-1 text-sm">Adicione produtos para montar seu pedido.</p>
        </div>
      </div>
    )
  }

  function handleCheckout() {
    navigate('/checkout')
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-border px-5 pb-4">
        <div className="rounded-xl bg-primary/10 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Resumo</p>
          <div className="mt-1 flex items-end justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {totalItems} item{totalItems !== 1 ? 's' : ''} no carrinho
            </p>
            <p className="text-lg font-bold text-primary">{formatBRL(total)}</p>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        <div className="space-y-3">
          {items.map(({ produto, quantidade }) => (
            <article
              key={produto.id}
              className="rounded-xl border border-border bg-card p-3 shadow-sm"
            >
              <div className="flex gap-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Package className="h-6 w-6" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{produto.nome}</p>
                      <p className="mt-0.5 text-xs font-mono text-muted-foreground">{produto.codigo}</p>
                    </div>
                    <button
                      type="button"
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => removeItem(produto.id)}
                      title="Remover"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Subtotal</p>
                      <p className="text-sm font-bold text-primary">{formatBRL(produto.preco * quantidade)}</p>
                    </div>

                    <div className="flex items-center rounded-lg border border-border bg-background p-1">
                      <button
                        type="button"
                        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        onClick={() => updateQuantity(produto.id, quantidade - 1)}
                        title="Diminuir"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold tabular-nums">{quantidade}</span>
                      <button
                        type="button"
                        className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        onClick={() => updateQuantity(produto.id, quantidade + 1)}
                        title="Aumentar"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="border-t border-border bg-popover px-5 py-4 shadow-[0_-10px_30px_rgba(0,0,0,0.04)]">
        <div className="mb-3 space-y-2 text-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Itens</span>
            <span>{totalItems}</span>
          </div>
          <div className="flex items-center justify-between font-semibold">
            <span>Total</span>
            <span className="text-lg font-bold text-primary">{formatBRL(total)}</span>
          </div>
        </div>

        <Button className="h-11 w-full font-semibold" onClick={handleCheckout}>
          Finalizar pedido
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
