import { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { CartItem, Produto } from '@/types'

interface CartContextValue {
  items: CartItem[]
  total: number
  totalItems: number
  addItem: (produto: Produto, quantidade?: number) => void
  removeItem: (produtoId: string) => void
  updateQuantity: (produtoId: string, quantidade: number) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const addItem = useCallback((produto: Produto, quantidade = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.produto.id === produto.id)
      if (existing) {
        return prev.map(i =>
          i.produto.id === produto.id ? { ...i, quantidade: i.quantidade + quantidade } : i
        )
      }
      return [...prev, { produto, quantidade }]
    })
  }, [])

  const removeItem = useCallback((produtoId: string) => {
    setItems(prev => prev.filter(i => i.produto.id !== produtoId))
  }, [])

  const updateQuantity = useCallback(
    (produtoId: string, quantidade: number) => {
      if (quantidade <= 0) {
        removeItem(produtoId)
        return
      }
      setItems(prev =>
        prev.map(i => (i.produto.id === produtoId ? { ...i, quantidade } : i))
      )
    },
    [removeItem]
  )

  const clear = useCallback(() => setItems([]), [])

  const total = items.reduce((acc, i) => acc + i.produto.preco * i.quantidade, 0)
  const totalItems = items.reduce((acc, i) => acc + i.quantidade, 0)

  return (
    <CartContext.Provider
      value={{ items, total, totalItems, addItem, removeItem, updateQuantity, clear }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
