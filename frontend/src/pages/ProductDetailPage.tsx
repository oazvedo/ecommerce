import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Tag, ShoppingCart, ArrowLeft, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Navbar } from '@/components/Navbar'
import { produtosApi } from '@/api/produtos'
import { useCart } from '@/context/CartContext'
import type { Produto } from '@/types'
import { toast } from 'sonner'

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const [produto, setProduto] = useState<Produto | null>(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)

  useEffect(() => {
    if (!id) return
    produtosApi.get(id).then(setProduto).catch(console.error).finally(() => setLoading(false))
  }, [id])

  function handleAdd() {
    if (!produto) return
    addItem(produto, qty)
    toast.success(`${produto.nome} adicionado ao carrinho`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <Navbar />
        <main className="mx-auto max-w-4xl px-4 py-8">
          <Skeleton className="h-80 w-full rounded-xl" />
        </main>
      </div>
    )
  }

  if (!produto) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <Navbar />
        <main className="mx-auto max-w-4xl px-4 py-16 text-center text-muted-foreground">
          Produto não encontrado.
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Voltar
        </Button>

        <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col md:flex-row gap-8">
          <div className="bg-zinc-100 rounded-lg flex items-center justify-center md:w-72 h-64 shrink-0">
            <Tag className="h-20 w-20 text-zinc-300" />
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{produto.codigo}</p>
              <h1 className="text-2xl font-bold mt-1">{produto.nome}</h1>
            </div>

            {!produto.status ? (
              <Badge variant="secondary">Indisponível</Badge>
            ) : (
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Em estoque</Badge>
            )}

            <p className="text-muted-foreground text-sm leading-relaxed">{produto.descricao}</p>

            <Separator />

            <p className="text-3xl font-bold text-orange-600">
              {produto.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>

            <div className="flex items-center gap-3">
              <div className="flex items-center border rounded-md">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                >
                  −
                </Button>
                <span className="w-10 text-center text-sm font-medium">{qty}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setQty(q => q + 1)}
                >
                  +
                </Button>
              </div>

              <Button
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                disabled={!produto.status}
                onClick={handleAdd}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Adicionar ao Carrinho
              </Button>
            </div>

            <Button variant="outline" className="w-full" onClick={() => navigate('/checkout')}>
              <Package className="mr-2 h-4 w-4" />
              Ir para o Checkout
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
