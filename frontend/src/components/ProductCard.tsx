import { ShoppingCart, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Produto } from '@/types'
import { useCart } from '@/context/CartContext'
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

export function ProductCard({ produto }: { produto: Produto }) {
  const { addItem } = useCart()

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault()
    addItem(produto)
    toast.success(`${produto.nome} adicionado ao carrinho`)
  }

  return (
    <Card className="group flex flex-col overflow-hidden rounded-xl border border-border/50 shadow-sm hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 hover:-translate-y-0.5 bg-card">
      <Link to={`/produto/${produto.id}`} className="block">
        <div
          className={`relative flex h-36 items-center justify-center bg-gradient-to-br ${cardGradient(produto.nome)} overflow-hidden`}
        >
          <span className="text-5xl font-black text-white/20 select-none tracking-tight uppercase">
            {initials(produto.nome)}
          </span>
          {!produto.status && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-zinc-700">
                Indisponível
              </span>
            </div>
          )}
        </div>
      </Link>

      <CardContent className="flex flex-1 flex-col p-3">
        <Link to={`/produto/${produto.id}`}>
          <p className="line-clamp-2 text-sm font-medium leading-tight hover:text-primary transition-colors">
            {produto.nome}
          </p>
        </Link>

        <p className="mt-0.5 text-[11px] text-muted-foreground font-mono">{produto.codigo}</p>

        <div className="mt-1 flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
          ))}
        </div>

        <p className="mt-2 text-base font-bold">
          {produto.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </p>

        {produto.preco >= 100 && produto.status && (
          <Badge
            variant="secondary"
            className="mt-1 w-fit bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] px-1.5 py-0 border-green-500/20"
          >
            Frete grátis
          </Badge>
        )}
      </CardContent>

      <CardFooter className="p-3 pt-0">
        <Button
          size="sm"
          className="w-full font-semibold text-xs h-8 transition-colors"
          disabled={!produto.status}
          onClick={handleAdd}
        >
          <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
          Adicionar ao carrinho
        </Button>
      </CardFooter>
    </Card>
  )
}
