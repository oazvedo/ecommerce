import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Minus,
  Package,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Tag,
  Truck,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Navbar } from '@/components/Navbar'
import { produtosApi } from '@/api/produtos'
import { useCart } from '@/context/CartContext'
import { resolveImageUrl } from '@/api/upload'
import type { Produto } from '@/types'
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

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const [produto, setProduto] = useState<Produto | null>(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    produtosApi.get(id).then(setProduto).catch(console.error).finally(() => setLoading(false))
  }, [id])

  function handleAdd() {
    if (!produto) return
    addItem(produto, qty)
    toast.success(`${produto.nome} adicionado ao carrinho`)
  }

  function handleCheckout() {
    if (produto) addItem(produto, qty)
    navigate('/checkout')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-6">
          <Skeleton className="h-[520px] w-full rounded-xl" />
        </main>
      </div>
    )
  }

  if (!produto) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-4xl px-4 py-16 text-center text-muted-foreground">
          Produto não encontrado.
        </main>
      </div>
    )
  }

  const outOfStock = produto.estoque === 0
  const lowStock = produto.estoque > 0 && produto.estoque <= 10
  const subtotal = produto.preco * qty

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-5">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>

        <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
          <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="grid gap-6 md:grid-cols-[320px_1fr]">
              <div
                className={`relative flex h-72 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br md:h-80 ${cardGradient(produto.nome)}`}
              >
                {produto.imagemUrl && (
                  <img
                    src={resolveImageUrl(produto.imagemUrl)!}
                    alt={produto.nome}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
                <div className="absolute left-4 top-4 flex items-center gap-2">
                  <Badge className="border-white/20 bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-zinc-800 hover:bg-white">
                    {produto.status ? 'Disponível' : 'Pausado'}
                  </Badge>
                </div>
                {!produto.imagemUrl && (
                  <span className="text-6xl font-black uppercase tracking-tight text-white/25 select-none md:text-7xl">
                    {initials(produto.nome)}
                  </span>
                )}
              </div>

              <div className="flex flex-col justify-between gap-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary">{produto.codigo}</p>
                  <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">{produto.nome}</h1>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {!produto.status ? (
                      <Badge variant="secondary">Indisponível</Badge>
                    ) : outOfStock ? (
                      <Badge className="gap-1 border-red-500/20 bg-red-500/10 text-red-700 hover:bg-red-500/10 dark:text-red-400">
                        <XCircle className="h-3.5 w-3.5" />
                        Fora de estoque
                      </Badge>
                    ) : lowStock ? (
                      <Badge className="gap-1 border-amber-500/20 bg-amber-500/10 text-amber-700 hover:bg-amber-500/10 dark:text-amber-400">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Restam apenas {produto.estoque} unidade{produto.estoque > 1 ? 's' : ''}
                      </Badge>
                    ) : (
                      <Badge className="gap-1 border-emerald-500/20 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-300">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Em estoque
                      </Badge>
                    )}
                    {produto.freteGratis && (
                      <Badge variant="outline" className="gap-1">
                        <Truck className="h-3.5 w-3.5" />
                        Frete grátis
                      </Badge>
                    )}
                  </div>

                  {produto.variantes && (
                    <div className="mt-4">
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Variantes</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {produto.variantes.split(',').map(v => v.trim()).filter(Boolean).map(v => (
                          <Badge key={v} variant="outline" className="gap-1 font-medium">
                            <Tag className="h-3 w-3" />
                            {v}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-5 flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="ml-2 text-sm text-muted-foreground">Produto recomendado</span>
                  </div>

                  <div className="mt-6 rounded-xl border border-border bg-background p-4">
                    <p className="text-sm font-semibold">Descrição</p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {produto.descricao || 'Produto disponível para compra imediata.'}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <ProductBenefit icon={<ShieldCheck className="h-4 w-4" />} label="Compra segura" />
                  <ProductBenefit icon={<Truck className="h-4 w-4" />} label="Entrega rápida" />
                  <ProductBenefit icon={<Sparkles className="h-4 w-4" />} label="Suporte ativo" />
                </div>
              </div>
            </div>
          </section>

          <aside className="h-fit rounded-xl border border-border bg-card p-5 shadow-sm lg:sticky lg:top-28">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Valor unitário</p>
            <p className="mt-2 text-4xl font-bold tracking-tight text-primary">
              {formatBRL(produto.preco)}
            </p>

            <div className="mt-5 rounded-xl border border-border bg-background p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold">Quantidade</span>
                <span className="text-xs text-muted-foreground">mín. 1</span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-border bg-card p-1">
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="text-base font-bold tabular-nums">{qty}</span>
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  onClick={() => setQty(q => q + 1)}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-bold text-foreground">{formatBRL(subtotal)}</span>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Button className="h-11 w-full font-semibold" disabled={!produto.status || outOfStock} onClick={handleAdd}>
                <ShoppingCart className="h-4 w-4" />
                {outOfStock ? 'Fora de estoque' : 'Adicionar ao carrinho'}
              </Button>
              <Button variant="outline" className="h-11 w-full font-semibold" disabled={!produto.status || outOfStock} onClick={handleCheckout}>
                <Package className="h-4 w-4" />
                Ir para o checkout
              </Button>
            </div>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              O pedido usará a quantidade selecionada acima.
            </p>
          </aside>
        </div>
      </main>
    </div>
  )
}

function ProductBenefit({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
      <span className="text-primary">{icon}</span>
      <span className="font-medium">{label}</span>
    </div>
  )
}

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
