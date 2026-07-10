import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useCart } from '@/context/CartContext'

export function CartSheet() {
  const { items, total, updateQuantity, removeItem } = useCart()
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
        <ShoppingBag className="h-12 w-12 opacity-30" />
        <p>Seu carrinho está vazio</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {items.map(({ produto, quantidade }) => (
          <div key={produto.id} className="flex gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{produto.nome}</p>
              <p className="text-xs text-muted-foreground">{produto.codigo}</p>
              <p className="text-sm font-semibold text-primary mt-1">
                {(produto.preco * quantidade).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                onClick={() => removeItem(produto.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => updateQuantity(produto.id, quantidade - 1)}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-6 text-center text-sm">{quantidade}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => updateQuantity(produto.id, quantidade + 1)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-4 space-y-3">
        <Separator />
        <div className="flex justify-between text-sm font-semibold">
          <span>Total</span>
          <span className="text-primary">
            {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </div>
        <Button
          className="w-full"
          onClick={() => navigate('/checkout')}
        >
          Finalizar Pedido
        </Button>
      </div>
    </div>
  )
}
