import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Building2, Users, Package, ShoppingBag, Wallet } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { AdminLayout } from '@/layouts/AdminLayout'
import { OrderStatusBadge } from '@/components/OrderStatusBadge'
import { empresasApi } from '@/api/empresas'
import { usuariosApi } from '@/api/usuarios'
import { produtosApi } from '@/api/produtos'
import { pedidosApi } from '@/api/pedidos'
import { carteiraApi } from '@/api/carteira'
import type { Pedido, PedidoStatus, Usuario } from '@/types'
import { cn } from '@/lib/utils'

const STATUS_LIST: { status: PedidoStatus; label: string; color: string }[] = [
  { status: 'Criado', label: 'Criado', color: 'bg-slate-500/15 text-slate-600 dark:text-slate-400' },
  { status: 'EmProcessamento', label: 'Em andamento', color: 'bg-blue-500/15 text-blue-600 dark:text-blue-400' },
  { status: 'Suporte', label: 'Suporte', color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400' },
  { status: 'Finalizado', label: 'Finalizado', color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' },
  { status: 'Cancelado', label: 'Cancelado', color: 'bg-red-500/15 text-red-600 dark:text-red-400' },
]

const CARGO_COLORS: Record<string, string> = {
  Administrador: 'bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/20',
  Diretor: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20',
  Gerente: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  Operador: 'bg-secondary text-secondary-foreground border-border',
}

export function AdminOverviewPage() {
  const navigate = useNavigate()

  const [counts, setCounts] = useState<Record<string, number | null>>({
    empresas: null, usuarios: null, produtos: null, pedidos: null, carteiras: null,
  })
  const [statusCounts, setStatusCounts] = useState<Record<string, number | null>>({})
  const [recentPedidos, setRecentPedidos] = useState<Pedido[] | null>(null)
  const [recentUsuarios, setRecentUsuarios] = useState<Usuario[] | null>(null)

  useEffect(() => {
    Promise.allSettled([
      empresasApi.list(1, 1),
      usuariosApi.list(1, 1),
      produtosApi.list(1, 1),
      pedidosApi.list({ page: 1, pageSize: 1 }),
      carteiraApi.list(1, 1),
    ]).then(([emp, usu, prod, ped, cart]) => {
      setCounts({
        empresas: emp.status === 'fulfilled' ? emp.value.totalCount : 0,
        usuarios: usu.status === 'fulfilled' ? usu.value.totalCount : 0,
        produtos: prod.status === 'fulfilled' ? prod.value.totalCount : 0,
        pedidos: ped.status === 'fulfilled' ? ped.value.totalCount : 0,
        carteiras: cart.status === 'fulfilled' ? cart.value.totalCount : 0,
      })
    })

    Promise.allSettled(
      STATUS_LIST.map(({ status }) => pedidosApi.list({ page: 1, pageSize: 1, status }))
    ).then(results => {
      const map: Record<string, number> = {}
      STATUS_LIST.forEach(({ status }, i) => {
        map[status] = results[i].status === 'fulfilled' ? results[i].value.totalCount : 0
      })
      setStatusCounts(map)
    })

    pedidosApi.list({ page: 1, pageSize: 8 })
      .then(r => setRecentPedidos(r.items))
      .catch(() => setRecentPedidos([]))

    usuariosApi.list(1, 8)
      .then(r => setRecentUsuarios(r.items))
      .catch(() => setRecentUsuarios([]))
  }, [])

  const statItems = [
    { label: 'empresas', key: 'empresas', to: '/admin/empresas', icon: Building2, color: 'text-violet-500' },
    { label: 'usuários', key: 'usuarios', to: '/admin/usuarios', icon: Users, color: 'text-blue-500' },
    { label: 'produtos', key: 'produtos', to: '/admin/produtos', icon: Package, color: 'text-emerald-500' },
    { label: 'pedidos', key: 'pedidos', to: '/admin/pedidos', icon: ShoppingBag, color: 'text-amber-500' },
    { label: 'carteiras', key: 'carteiras', to: '/admin/carteiras', icon: Wallet, color: 'text-pink-500' },
  ]

  const totalPedidos = Object.values(statusCounts).reduce<number>((s, v) => s + (v ?? 0), 0)

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Visão Geral</h1>
        </div>

        {/* Compact stat strip */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-border bg-card px-5 py-3.5">
          {statItems.map(({ label, key, to, icon: Icon, color }, i) => (
            <span key={key} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-border select-none mr-2.5">·</span>}
              <button
                onClick={() => navigate(to)}
                className="group flex items-center gap-2 hover:text-primary transition-colors"
              >
                <Icon className={`h-3.5 w-3.5 shrink-0 ${color}`} />
                {counts[key] === null ? (
                  <Skeleton className="h-4 w-8 inline-block" />
                ) : (
                  <span className="font-bold text-foreground group-hover:text-primary">{counts[key]?.toLocaleString('pt-BR')}</span>
                )}
                <span className="text-sm text-muted-foreground">{label}</span>
              </button>
            </span>
          ))}
        </div>

        {/* Two-column layout */}
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">

          {/* Left: recent pedidos */}
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold">Pedidos recentes</CardTitle>
              <button
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => navigate('/admin/pedidos')}
              >
                Ver todos
              </button>
            </CardHeader>
            <CardContent className="p-0">
              {recentPedidos === null ? (
                <div className="px-4 pb-4 space-y-3">
                  {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-11 rounded" />)}
                </div>
              ) : recentPedidos.length === 0 ? (
                <p className="pb-6 text-center text-sm text-muted-foreground">Nenhum pedido.</p>
              ) : (
                <div className="divide-y divide-border">
                  {recentPedidos.map(p => (
                    <button
                      key={p.id}
                      className="flex w-full items-center justify-between px-4 py-2.5 text-left hover:bg-muted/30 transition-colors"
                      onClick={() => navigate(`/pedido/${p.id}`)}
                    >
                      <div className="flex-1 min-w-0 flex items-center gap-3">
                        <OrderStatusBadge status={p.status} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{p.usuario_nome}</p>
                          <p className="text-xs text-muted-foreground truncate">{p.empresa_nome}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm font-semibold text-primary">
                          {(p.valor_total ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right column */}
          <div className="space-y-6">

            {/* Status breakdown */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Pedidos por status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {STATUS_LIST.map(({ status, label, color }) => {
                  const count = statusCounts[status] ?? null
                  const pct = totalPedidos > 0 && count !== null ? Math.round((count / totalPedidos) * 100) : 0
                  return (
                    <div key={status} className="flex items-center gap-3">
                      <Badge className={cn('text-[10px] px-1.5 py-0 border-0 w-24 justify-center shrink-0', color)}>
                        {label}
                      </Badge>
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary/60 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      {count === null ? (
                        <Skeleton className="h-4 w-6 shrink-0" />
                      ) : (
                        <span className="text-xs font-semibold w-6 text-right shrink-0">{count}</span>
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Recent users */}
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold">Usuários recentes</CardTitle>
                <button
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => navigate('/admin/usuarios')}
                >
                  Ver todos
                </button>
              </CardHeader>
              <CardContent className="p-0">
                {recentUsuarios === null ? (
                  <div className="px-4 pb-4 space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-9 rounded" />)}
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {recentUsuarios.map(u => (
                      <button
                        key={u.id}
                        className="flex w-full items-center justify-between px-4 py-2.5 text-left hover:bg-muted/30 transition-colors"
                        onClick={() => navigate(`/admin/usuarios/${u.id}`)}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{u.nome}</p>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn('text-[10px] shrink-0 ml-2', CARGO_COLORS[u.cargo] ?? CARGO_COLORS.Operador)}
                        >
                          {u.cargo}
                        </Badge>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
