import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, ShoppingBag, AlertCircle, TrendingUp, Receipt } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/Navbar'
import { OrderStatusBadge } from '@/components/OrderStatusBadge'
import { Pagination } from '@/components/Pagination'
import { pedidosApi } from '@/api/pedidos'
import type { Pedido, PagedResult } from '@/types'
import { cn } from '@/lib/utils'

const STATUS_COLORS: Record<string, string> = {
  Criado: 'border-l-blue-500',
  EmProcessamento: 'border-l-amber-500',
  Suporte: 'border-l-orange-500',
  Finalizado: 'border-l-emerald-500',
  Cancelado: 'border-l-zinc-400',
}

export function MyOrdersPage() {
  const [result, setResult] = useState<PagedResult<Pedido> | null>(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    pedidosApi
      .meus(page, 10)
      .then(setResult)
      .catch(err => setError(err instanceof Error ? err.message : 'Erro ao carregar pedidos'))
      .finally(() => setLoading(false))
  }, [page])

  const totalGasto = result?.items.reduce((s, p) => s + (p.valor_total ?? 0), 0) ?? 0

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-6 space-y-5">

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            loading={loading}
            icon={<Receipt className="h-4 w-4" />}
            label="Total de pedidos"
            value={result ? String(result.totalCount) : null}
          />
          <StatCard
            loading={loading}
            icon={<TrendingUp className="h-4 w-4" />}
            label="Valor na página"
            value={result ? totalGasto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : null}
          />
        </div>

        {/* List */}
        {loading && (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center py-16 gap-3 text-muted-foreground">
            <AlertCircle className="h-10 w-10 text-destructive/50" />
            <p className="text-sm text-destructive font-medium">{error}</p>
          </div>
        )}

        {!loading && !error && result?.items.length === 0 && (
          <div className="flex flex-col items-center py-20 gap-4 text-muted-foreground">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <ShoppingBag className="h-8 w-8 opacity-40" />
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">Nenhum pedido ainda</p>
              <p className="text-sm mt-0.5">Seus pedidos aparecerão aqui</p>
            </div>
            <Link to="/" className="text-sm text-primary hover:underline">
              Explorar produtos →
            </Link>
          </div>
        )}

        {!loading && !error && result && result.items.length > 0 && (
          <>
            <div className="space-y-2">
              {result.items.map(pedido => (
                <PedidoRow key={pedido.id} pedido={pedido} />
              ))}
            </div>
            <Pagination page={page} totalPages={result.totalPages} onPageChange={setPage} />
          </>
        )}
      </main>
    </div>
  )
}

function StatCard({
  loading,
  icon,
  label,
  value,
}: {
  loading: boolean
  icon: React.ReactNode
  label: string
  value: string | null
}) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3.5">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      {loading || value === null ? (
        <Skeleton className="h-6 w-20" />
      ) : (
        <p className="text-lg font-bold">{value}</p>
      )}
    </div>
  )
}

function formatBRL(value: number | null | undefined) {
  return (value ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

function PedidoRow({ pedido }: { pedido: Pedido }) {
  const itens = pedido.itens ?? []
  const resumoItens =
    itens.length === 0
      ? 'Sem itens'
      : itens.length === 1
      ? itens[0].NomeProduto
      : `${itens[0].NomeProduto} +${itens.length - 1}`

  return (
    <Link to={`/pedido/${pedido.id}`} className="block group">
      <div
        className={cn(
          'flex items-center gap-4 rounded-xl border-l-4 bg-card px-4 py-3.5 border border-border/50 hover:shadow-md hover:shadow-primary/5 transition-all',
          STATUS_COLORS[pedido.status] ?? 'border-l-border'
        )}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <OrderStatusBadge status={pedido.status} />
            <Badge variant="outline" className="text-[11px] font-normal px-1.5 py-0">
              {pedido.contratacao}
            </Badge>
          </div>
          <p className="text-sm font-medium truncate leading-tight">{resumoItens}</p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {formatDate(pedido.criado_em)}
            {pedido.empresa_nome ? ` · ${pedido.empresa_nome}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <p className="text-base font-bold text-primary tabular-nums">{formatBRL(pedido.valor_total)}</p>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </div>
      </div>
    </Link>
  )
}
