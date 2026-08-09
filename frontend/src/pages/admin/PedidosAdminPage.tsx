import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MoreHorizontal, Trash2, ExternalLink, RefreshCw, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { AdminLayout } from '@/layouts/AdminLayout'
import { OrderStatusBadge } from '@/components/OrderStatusBadge'
import { Pagination } from '@/components/Pagination'
import { pedidosApi } from '@/api/pedidos'
import type { Pedido, PedidoStatus, PagedResult } from '@/types'
import { toast } from 'sonner'

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'Todos os status' },
  { value: 'Criado', label: 'Criado' },
  { value: 'EmProcessamento', label: 'Em Processamento' },
  { value: 'Suporte', label: 'Suporte' },
  { value: 'Finalizado', label: 'Finalizado' },
  { value: 'Cancelado', label: 'Cancelado' },
]

const ALL_STATUSES: { value: PedidoStatus; label: string }[] = [
  { value: 'Criado', label: 'Criado' },
  { value: 'EmProcessamento', label: 'Em Processamento' },
  { value: 'Suporte', label: 'Suporte' },
  { value: 'Finalizado', label: 'Finalizado' },
  { value: 'Cancelado', label: 'Cancelado' },
]

function primeiroDiaDoMes() {
  const hoje = new Date()
  return new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().slice(0, 10)
}

function hojeISO() {
  return new Date().toISOString().slice(0, 10)
}

export function PedidosAdminPage() {
  const navigate = useNavigate()
  const [result, setResult] = useState<PagedResult<Pedido> | null>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState<Pedido | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [dataInicio, setDataInicio] = useState(primeiroDiaDoMes)
  const [dataFim, setDataFim] = useState(hojeISO)
  const [exportando, setExportando] = useState(false)

  useEffect(() => { setPage(1) }, [status])

  useEffect(() => {
    setLoading(true)
    pedidosApi
      .list({ page, pageSize: 15, status: status !== 'all' ? (status as PedidoStatus) : undefined })
      .then(setResult)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [page, status])

  async function handleStatusChange(pedido: Pedido, newStatus: PedidoStatus) {
    try {
      const updated = await pedidosApi.updateStatus(pedido.id, newStatus)
      setResult(prev => prev ? {
        ...prev,
        items: prev.items.map(p => p.id === updated.id ? updated : p),
      } : prev)
      toast.success('Status atualizado.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao atualizar status')
    }
  }

  async function handleExportarCsv() {
    setExportando(true)
    try {
      const blob = await pedidosApi.relatorioCsv(dataInicio, dataFim)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `relatorio-pedidos-${dataInicio}-a-${dataFim}.csv`
      link.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao exportar relatório')
    } finally {
      setExportando(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await pedidosApi.delete(deleteTarget.id)
      toast.success('Pedido excluído.')
      setDeleteTarget(null)
      setResult(prev => prev ? {
        ...prev,
        items: prev.items.filter(p => p.id !== deleteTarget.id),
        totalCount: prev.totalCount - 1,
      } : prev)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao excluir')
    } finally {
      setDeleting(false)
    }
  }

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
          <div className="flex flex-wrap items-center gap-2">
            <Input
              type="date"
              value={dataInicio}
              onChange={e => setDataInicio(e.target.value)}
              className="w-40"
              aria-label="Data início"
            />
            <Input
              type="date"
              value={dataFim}
              onChange={e => setDataFim(e.target.value)}
              className="w-40"
              aria-label="Data fim"
            />
            <Button variant="outline" onClick={handleExportarCsv} disabled={exportando}>
              <Download className="mr-2 h-4 w-4" />
              {exportando ? 'Exportando...' : 'Exportar CSV'}
            </Button>
            <div className="w-48">
              <Select value={status} onValueChange={v => setStatus(v ?? 'all')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(o => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
                  <div key={p.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <OrderStatusBadge status={p.status} />
                        <Badge variant="outline" className="text-xs font-normal">{p.contratacao}</Badge>
                      </div>
                      <p className="text-sm font-medium truncate">{p.usuario_nome}</p>
                      <p className="text-xs text-muted-foreground">{p.empresa_nome}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bold text-primary text-sm">
                        {(p.valor_total ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/pedido/${p.id}`)}>
                            <ExternalLink className="mr-2 h-4 w-4 text-blue-500" />
                            Ver detalhes
                          </DropdownMenuItem>
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                              <RefreshCw className="mr-2 h-4 w-4 text-blue-500" />
                              Alterar status
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                              {ALL_STATUSES.map(s => (
                                <DropdownMenuItem
                                  key={s.value}
                                  disabled={p.status === s.value}
                                  onClick={() => handleStatusChange(p, s.value)}
                                >
                                  {s.label}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeleteTarget(p)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {result && result.totalPages > 1 && (
          <Pagination page={page} totalPages={result.totalPages} onPageChange={setPage} />
        )}
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir pedido</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este pedido de <strong>{deleteTarget?.usuario_nome}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  )
}
