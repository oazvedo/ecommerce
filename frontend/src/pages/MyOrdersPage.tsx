import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  Building2,
  CalendarDays,
  ChevronRight,
  PackageCheck,
  Receipt,
  ShoppingBag,
  TrendingUp,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { OrderStatusBadge } from '@/components/OrderStatusBadge'
import { Pagination } from '@/components/Pagination'
import { pedidosApi } from '@/api/pedidos'
import type { Pedido, PedidoStatus, PagedResult } from '@/types'
import { cn } from '@/lib/utils'

type StatusFilter = 'Todos' | PedidoStatus

const EMPTY_ORDERS: Pedido[] = []

const STATUS_COLORS: Record<string, string> = {
  Criado: 'border-l-blue-500',
  EmProcessamento: 'border-l-amber-500',
  Suporte: 'border-l-orange-500',
  Finalizado: 'border-l-emerald-500',
  Cancelado: 'border-l-zinc-400',
}

const STATUS_FILTERS: StatusFilter[] = ['Todos', 'Criado', 'EmProcessamento', 'Suporte', 'Finalizado', 'Cancelado']

export function MyOrdersPage() {
  const [result, setResult] = useState<PagedResult<Pedido> | null>(null)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('Todos')
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

  const orders = result?.items ?? EMPTY_ORDERS
  const visibleOrders = useMemo(
    () => statusFilter === 'Todos' ? orders : orders.filter(order => order.status === statusFilter),
    [orders, statusFilter]
  )
  const totalGasto = visibleOrders.reduce((s, p) => s + (p.valor_total ?? 0), 0)
  const totalItens = visibleOrders.reduce(
    (sum, pedido) => sum + (pedido.itens ?? []).reduce((itemSum, item) => itemSum + (item.Quantidade ?? 0), 0),
    0
  )

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-5xl px-4 py-6">
        <section className="mb-5 rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">Meus pedidos</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight">Histórico de compras</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {result ? `${result.totalCount} pedido(s) encontrados` : 'Carregando pedidos'}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    'h-8 rounded-lg border px-3 text-xs font-semibold transition-colors',
                    statusFilter === status
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground'
                  )}
                >
                  {status === 'EmProcessamento' ? 'Em proc.' : status}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="mb-5 grid gap-3 sm:grid-cols-3">
          <StatCard
            loading={loading}
            icon={<Receipt className="h-4 w-4" />}
            label="Pedidos exibidos"
            value={String(visibleOrders.length)}
          />
          <StatCard
            loading={loading}
            icon={<TrendingUp className="h-4 w-4" />}
            label="Valor exibido"
            value={totalGasto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          />
          <StatCard
            loading={loading}
            icon={<PackageCheck className="h-4 w-4" />}
            label="Itens comprados"
            value={String(totalItens)}
          />
        </div>

        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card py-16 text-muted-foreground">
            <AlertCircle className="h-10 w-10 text-destructive/50" />
            <p className="text-sm font-medium text-destructive">{error}</p>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-card py-20 text-muted-foreground">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted">
              <ShoppingBag className="h-8 w-8 opacity-40" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">Nenhum pedido ainda</p>
              <p className="mt-0.5 text-sm">Seus pedidos aparecerão aqui</p>
            </div>
            <Link to="/" className="text-sm font-semibold text-primary hover:underline">
              Explorar produtos
            </Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && visibleOrders.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-card py-16 text-center text-sm text-muted-foreground">
            Nenhum pedido neste status.
          </div>
        )}

        {!loading && !error && visibleOrders.length > 0 && (
          <>
            <div className="space-y-3">
              {visibleOrders.map(pedido => (
                <PedidoRow key={pedido.id} pedido={pedido} />
              ))}
            </div>
            <Pagination page={page} totalPages={result?.totalPages ?? 1} onPageChange={setPage} />
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
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-4 shadow-sm">
      <div className="mb-2 flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs font-semibold">{label}</span>
      </div>
      {loading ? (
        <Skeleton className="h-7 w-24" />
      ) : (
        <p className="text-xl font-black tracking-tight">{value}</p>
      )}
    </div>
  )
}

function formatBRL(value: number | null | undefined) {
  return (value ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return '--'
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function PedidoRow({ pedido }: { pedido: Pedido }) {
  const itens = pedido.itens ?? []
  const totalItens = itens.reduce((sum, item) => sum + (item.Quantidade ?? 0), 0)
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
          'grid gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 md:grid-cols-[1fr_auto]',
          STATUS_COLORS[pedido.status] ?? 'border-l-border',
          'border-l-4'
        )}
      >
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <OrderStatusBadge status={pedido.status} />
            <Badge variant="outline" className="text-xs font-medium">
              {pedido.contratacao}
            </Badge>
            <span className="text-xs text-muted-foreground">#{pedido.id.slice(0, 8)}</span>
          </div>

          <p className="truncate text-base font-bold leading-tight">{resumoItens}</p>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDate(pedido.criado_em)}
            </span>
            {pedido.empresa_nome && (
              <span className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                {pedido.empresa_nome}
              </span>
            )}
            <span>{totalItens} item{totalItens !== 1 ? 's' : ''}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 md:justify-end">
          <div className="text-left md:text-right">
            <p className="text-xs font-medium text-muted-foreground">Total</p>
            <p className="text-xl font-black text-primary tabular-nums">{formatBRL(pedido.valor_total)}</p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-foreground" />
        </div>
      </div>
    </Link>
  )
}
