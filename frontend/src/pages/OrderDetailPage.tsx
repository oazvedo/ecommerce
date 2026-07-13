import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, XCircle, Check, Building2, CalendarDays, CreditCard, User, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/Navbar'
import { pedidosApi } from '@/api/pedidos'
import type { Pedido, PedidoStatus } from '@/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const STATUS_ORDER: PedidoStatus[] = ['Criado', 'EmProcessamento', 'Finalizado']
const STATUS_LABELS: Record<PedidoStatus, string> = {
  Criado: 'Criado',
  EmProcessamento: 'Em Processamento',
  Suporte: 'Suporte',
  Finalizado: 'Finalizado',
  Cancelado: 'Cancelado',
}

function StatusTimeline({ status }: { status: PedidoStatus }) {
  if (status === 'Cancelado') {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-destructive">
        <XCircle className="h-5 w-5 shrink-0" />
        <div>
          <p className="text-sm font-semibold">Pedido cancelado</p>
          <p className="text-xs text-destructive/70 mt-0.5">Este pedido foi cancelado e não pode ser alterado</p>
        </div>
      </div>
    )
  }

  const steps = status === 'Suporte'
    ? ['Criado', 'EmProcessamento', 'Suporte'] as PedidoStatus[]
    : STATUS_ORDER

  const currentIdx = steps.indexOf(status)

  return (
    <div className="flex items-start gap-0">
      {steps.map((step, i) => {
        const done = i < currentIdx
        const active = i === currentIdx
        return (
          <div key={step} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              <div className={cn('h-0.5 flex-1', i === 0 ? 'invisible' : done || active ? 'bg-primary' : 'bg-border')} />
              <div
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all',
                  done
                    ? 'border-primary bg-primary text-primary-foreground'
                    : active
                    ? 'border-primary bg-background text-primary shadow-md shadow-primary/20'
                    : 'border-border bg-background text-muted-foreground'
                )}
              >
                {done ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="text-xs font-bold">{i + 1}</span>
                )}
              </div>
              <div className={cn('h-0.5 flex-1', i === steps.length - 1 ? 'invisible' : done ? 'bg-primary' : 'bg-border')} />
            </div>
            <p
              className={cn(
                'mt-1.5 text-center text-[11px] font-medium leading-tight',
                active ? 'text-primary' : done ? 'text-muted-foreground' : 'text-muted-foreground/50'
              )}
            >
              {STATUS_LABELS[step]}
            </p>
          </div>
        )
      })}
    </div>
  )
}

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [pedido, setPedido] = useState<Pedido | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    if (!id) return
    pedidosApi.get(id).then(setPedido).catch(console.error).finally(() => setLoading(false))
  }, [id])

  async function handleCancel() {
    if (!pedido) return
    setCancelling(true)
    try {
      const updated = await pedidosApi.cancelar(pedido.id)
      setPedido(updated)
      toast.success('Pedido cancelado.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao cancelar')
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-2xl px-4 py-8 space-y-4">
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </main>
      </div>
    )
  }

  if (!pedido) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-2xl px-4 py-16 text-center text-muted-foreground">
          Pedido não encontrado.
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-6 space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Voltar
        </Button>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-0.5">Pedido</p>
                <CardTitle className="text-base font-mono text-muted-foreground font-normal">{pedido.id}</CardTitle>
              </div>
              <ContratacaoBadge contratacao={pedido.contratacao} />
            </div>
          </CardHeader>
          <CardContent>
            <StatusTimeline status={pedido.status} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-2">
                <Building2 className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Empresa</p>
                  <p className="text-sm font-semibold mt-0.5">{pedido.empresa_nome}</p>
                  <p className="text-xs text-muted-foreground">{pedido.empresa_cnpj}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Cliente</p>
                  <p className="text-sm font-semibold mt-0.5">{pedido.usuario_nome}</p>
                </div>
              </div>
              <div className="flex items-start gap-2 col-span-2">
                <CalendarDays className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Data do pedido</p>
                  <p className="text-sm font-semibold mt-0.5">
                    {new Date(pedido.criado_em).toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Pagamento */}
            <div className="flex items-start gap-2">
              {pedido.forma_pagamento === 'Parcelado'
                ? <CreditCard className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                : <Wallet className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              }
              <div>
                <p className="text-xs text-muted-foreground font-medium">Pagamento</p>
                {pedido.forma_pagamento === 'Parcelado' && pedido.parcelas ? (
                  <p className="text-sm font-semibold mt-0.5">
                    {pedido.parcelas}× de{' '}
                    {(pedido.valor_total / pedido.parcelas).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    {' '}
                    <span className="text-xs font-normal text-muted-foreground">sem juros</span>
                  </p>
                ) : (
                  <p className="text-sm font-semibold mt-0.5">Carteira digital</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Total: {pedido.valor_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm font-semibold mb-3">Itens do pedido</p>
              <div className="space-y-2">
                {(pedido.itens ?? []).map(item => (
                  <div key={item.ProdutoId} className="flex items-center justify-between gap-4 rounded-lg bg-muted/50 px-3 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-secondary text-xs font-bold">
                        {item.Quantidade}×
                      </span>
                      <span className="text-sm truncate">{item.NomeProduto}</span>
                    </div>
                    <span className="text-sm font-semibold shrink-0">
                      {(item.Subtotal ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center rounded-xl bg-primary/10 border border-primary/20 px-4 py-3">
              <span className="font-semibold">Total do pedido</span>
              <span className="text-xl font-extrabold text-primary">
                {(pedido.valor_total ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>

            {pedido.status !== 'Cancelado' && pedido.status !== 'Finalizado' && (
              <Button
                variant="outline"
                className="w-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/50"
                onClick={handleCancel}
                disabled={cancelling}
              >
                <XCircle className="mr-2 h-4 w-4" />
                {cancelling ? 'Cancelando...' : 'Cancelar Pedido'}
              </Button>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

function ContratacaoBadge({ contratacao }: { contratacao: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'font-semibold',
        contratacao === 'Anual'
          ? 'border-primary/30 bg-primary/10 text-primary'
          : 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400'
      )}
    >
      {contratacao}
    </Badge>
  )
}
