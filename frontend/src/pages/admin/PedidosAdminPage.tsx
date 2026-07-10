import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AdminLayout } from '@/layouts/AdminLayout'
import { OrderStatusBadge } from '@/components/OrderStatusBadge'
import { Pagination } from '@/components/Pagination'
import { pedidosApi } from '@/api/pedidos'
import type { Pedido, PedidoStatus, PagedResult } from '@/types'

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'Todos os status' },
  { value: 'Criado', label: 'Criado' },
  { value: 'EmProcessamento', label: 'Em Processamento' },
  { value: 'Suporte', label: 'Suporte' },
  { value: 'Finalizado', label: 'Finalizado' },
  { value: 'Cancelado', label: 'Cancelado' },
]

export function PedidosAdminPage() {
  const navigate = useNavigate()
  const [result, setResult] = useState<PagedResult<Pedido> | null>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<string>('all')
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [status])

  useEffect(() => {
    setLoading(true)
    pedidosApi
      .list({
        page,
        pageSize: 15,
        status: status !== 'all' ? (status as PedidoStatus) : undefined,
      })
      .then(setResult)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [page, status])

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Pedidos</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {result ? `${result.totalCount} pedido(s)` : ''}
            </p>
          </div>
          <div className="w-48">
            <Select value={status} onValueChange={v => setStatus(v ?? 'all')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(o => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-14 rounded" />)}
              </div>
            ) : result?.items.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <p>Nenhum pedido encontrado.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {result?.items.map(p => (
                  <button
                    key={p.id}
                    className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-muted/30 transition-colors"
                    onClick={() => navigate(`/pedido/${p.id}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <OrderStatusBadge status={p.status} />
                        <Badge variant="outline" className="text-xs font-normal">{p.contratacao}</Badge>
                      </div>
                      <p className="text-sm font-medium truncate">{p.usuario_nome}</p>
                      <p className="text-xs text-muted-foreground">{p.empresa_nome}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-bold text-primary text-sm">
                        {(p.valor_total ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {result && result.totalPages > 1 && (
          <Pagination page={page} totalPages={result.totalPages} onPageChange={setPage} />
        )}
      </div>
    </AdminLayout>
  )
}
