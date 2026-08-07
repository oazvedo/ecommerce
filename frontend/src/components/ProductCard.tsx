import { CheckCircle2, Package, ShoppingCart, Star, Truck, AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Produto } from '@/types'
import { useCart } from '@/context/CartContext'
import { resolveImageUrl } from '@/api/upload'
import { toast } from 'sonner'

const GRADIENTS = [
  'from-violet-500 to-purple-700',
  'from-blue-500 to-indigo-700',
  'from-emerald-500 to-teal-700',
  'from-rose-500 to-pink-700',
  'from-amber-500 to-orange-600',
  'from-cyan-500 to-blue-600',
  'from-red-500 to-rose-700',
  'from-lime-600 to-green-700',
]

function cardGradient(nome: string): string {
  const hash = nome.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return GRADIENTS[hash % GRADIENTS.length]
}

function initials(nome: string): string {
  return nome
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()
}

function stockLabel(estoque: number): { label: string; className: string } | null {
  if (estoque === 0) return { label: 'Fora de estoque', className: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20' }
  if (estoque <= 10) return { label: `Restam ${estoque} unidade${estoque > 1 ? 's' : ''}`, className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20' }
  return null
}

export function ProductCard({ produto }: { produto: Produto }) {
  const { addItem } = useCart()
  const outOfStock = produto.estoque === 0
  const stock = stockLabel(produto.estoque)

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault()
    if (outOfStock) return
    addItem(produto)
    toast.success(`${produto.nome} adicionado ao carrinho`)
  }

  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-xl border border-border/70 bg-card p-0 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10">
      <Link to={`/produto/${produto.id}`} className="block">
        <div
          className={`relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-br ${cardGradient(produto.nome)}`}
        >
          {produto.imagemUrl && (
            <img
              src={resolveImageUrl(produto.imagemUrl)!}
              alt={produto.nome}
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}

          <div className="absolute inset-x-3 top-3 flex items-center justify-between">
            <Badge className="border-white/20 bg-white/90 px-2 py-0 text-[10px] font-bold text-zinc-800 hover:bg-white">
              {produto.status ? 'Disponível' : 'Pausado'}
            </Badge>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15 text-white backdrop-blur">
              <Package className="h-3.5 w-3.5" />
            </span>
          </div>

          {!produto.imagemUrl && (
            <span className="text-6xl font-black uppercase tracking-tight text-white/25 select-none">
              {initials(produto.nome)}
            </span>
          )}

          {(!produto.status || outOfStock) && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-zinc-700">
                {outOfStock ? 'Sem estoque' : 'Indisponível'}
              </span>
            </div>
          )}
        </div>
      </Link>

      <CardContent className="flex flex-1 flex-col p-4">
        <Link to={`/produto/${produto.id}`}>
          <p className="line-clamp-2 text-base font-semibold leading-tight transition-colors hover:text-primary">
            {produto.nome}
          </p>
        </Link>

        <p className="mt-1 line-clamp-2 min-h-9 text-xs leading-relaxed text-muted-foreground">
          {produto.descricao || 'Produto disponível para compra imediata.'}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            ))}
          </div>

          {produto.freteGratis && (
            <Badge
              variant="secondary"
              className="gap-1 border-emerald-500/20 bg-emerald-500/10 px-2 py-0 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300"
            >
              <CheckCircle2 className="h-3 w-3" />
              Frete grátis
            </Badge>
          )}
        </div>

        {stock && (
          <div className={`mt-2 flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-semibold ${stock.className}`}>
            <AlertTriangle className="h-3 w-3 shrink-0" />
            {stock.label}
          </div>
        )}

        <p className="mt-3 text-xl font-black tracking-tight">
          {produto.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </p>
      </CardContent>

      <CardFooter className="border-t bg-muted/30 p-3">
        <Button
          size="lg"
          className="h-10 w-full font-semibold"
          disabled={!produto.status || outOfStock}
          onClick={handleAdd}
        >
          <ShoppingCart className="h-4 w-4" />
          {outOfStock ? 'Indisponível' : 'Adicionar ao carrinho'}
        </Button>
      </CardFooter>
    </Card>
  )
}
