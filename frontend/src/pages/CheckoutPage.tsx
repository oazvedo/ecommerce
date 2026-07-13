import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Repeat2,
  Wallet,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Navbar } from '@/components/Navbar'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { pedidosApi } from '@/api/pedidos'
import { carteiraApi } from '@/api/carteira'
import type { Carteira } from '@/types'
import type { PedidoContratacao } from '@/types'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type FormaPagamento = 'Carteira' | 'Parcelado'

const PARCELAS_OPTIONS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function CheckoutPage() {
  const { items, total, clear } = useCart()
  const { usuario } = useAuth()
  const navigate = useNavigate()

  const [contratacao, setContratacao] = useState<PedidoContratacao>('Mensal')
  const [formaPagamento, setFormaPagamento] = useState<FormaPagamento>('Carteira')
  const [parcelas, setParcelas] = useState<number>(2)
  const [carteira, setCarteira] = useState<Carteira | null>(null)
  const [carteiraLoading, setCarteiraLoading] = useState(true)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    carteiraApi.minha()
      .then(setCarteira)
      .catch(() => null)
      .finally(() => setCarteiraLoading(false))
  }, [])

  useEffect(() => {
    if (contratacao === 'Anual') setFormaPagamento('Carteira')
  }, [contratacao])

  const saldo = carteira?.saldo ?? 0
  const saldoSuficiente = saldo >= total
  const valorParcela = total / parcelas
  const isMensal = contratacao === 'Mensal'
  const isParcelado = isMensal && formaPagamento === 'Parcelado'

  async function handleConfirm() {
    if (!usuario?.empresa_id) { toast.error('Empresa não encontrada no seu perfil.'); return }
    if (items.length === 0) { toast.error('Carrinho vazio.'); return }
    if (formaPagamento === 'Carteira' && !saldoSuficiente) { toast.error('Saldo insuficiente na carteira.'); return }

    setLoading(true)
    try {
      const pedido = await pedidosApi.create({
        empresa_id: usuario.empresa_id,
        contratacao,
        forma_pagamento: formaPagamento,
        parcelas: isParcelado ? parcelas : null,
        itens: items.map(i => ({ produto_id: i.produto.id, quantidade: i.quantidade })),
      })
      clear()
      toast.success('Pedido criado com sucesso!')
      navigate(`/pedido/${pedido.id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao criar pedido')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-2xl px-4 py-16 text-center text-muted-foreground">
          <p className="text-lg">Seu carrinho está vazio.</p>
          <Button className="mt-4" onClick={() => navigate('/')}>Explorar Produtos</Button>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-5">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">Finalizar Pedido</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {items.length} item{items.length !== 1 ? 's' : ''} no carrinho
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_380px]">

          {/* ── Coluna esquerda ── */}
          <div className="space-y-5">

            {/* Itens */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Itens do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-0 p-0">
                {items.map(({ produto, quantidade }, idx) => (
                  <div
                    key={produto.id}
                    className={cn(
                      'flex items-center gap-3 px-5 py-3',
                      idx < items.length - 1 && 'border-b border-border'
                    )}
                  >
                    {produto.imagemUrl ? (
                      <img
                        src={produto.imagemUrl}
                        alt={produto.nome}
                        className="h-10 w-10 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-bold uppercase text-muted-foreground">
                        {produto.nome.slice(0, 2)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{produto.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatBRL(produto.preco)} × {quantidade}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold">
                      {formatBRL(produto.preco * quantidade)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between px-5 py-3 font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatBRL(total)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Tipo de Contratação */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Tipo de Contratação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {(['Mensal', 'Anual'] as const).map(tipo => (
                    <button
                      key={tipo}
                      type="button"
                      onClick={() => setContratacao(tipo)}
                      className={cn(
                        'flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all',
                        contratacao === tipo
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border bg-card hover:border-primary/40'
                      )}
                    >
                      <div className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-lg',
                        contratacao === tipo ? 'bg-primary/10' : 'bg-muted'
                      )}>
                        {tipo === 'Mensal'
                          ? <Repeat2 className={cn('h-4 w-4', contratacao === tipo ? 'text-primary' : 'text-muted-foreground')} />
                          : <CalendarDays className={cn('h-4 w-4', contratacao === tipo ? 'text-primary' : 'text-muted-foreground')} />
                        }
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{tipo}</p>
                        <p className="text-xs text-muted-foreground">
                          {tipo === 'Mensal'
                            ? 'Renovação mensal · Parcelamento disponível'
                            : 'Contrato anual · Pagamento via carteira'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Forma de Pagamento — só para Mensal */}
            {isMensal && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Forma de Pagamento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {/* Carteira */}
                    <button
                      type="button"
                      onClick={() => setFormaPagamento('Carteira')}
                      className={cn(
                        'flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all',
                        formaPagamento === 'Carteira'
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border bg-card hover:border-primary/40'
                      )}
                    >
                      <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', formaPagamento === 'Carteira' ? 'bg-primary/10' : 'bg-muted')}>
                        <Wallet className={cn('h-4 w-4', formaPagamento === 'Carteira' ? 'text-primary' : 'text-muted-foreground')} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Carteira Digital</p>
                        <p className="text-xs text-muted-foreground">À vista</p>
                      </div>
                      {carteiraLoading ? <Skeleton className="h-4 w-20" /> : (
                        <span className={cn('text-xs font-bold', saldoSuficiente ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400')}>
                          {formatBRL(saldo)}
                        </span>
                      )}
                    </button>

                    {/* Parcelar */}
                    <button
                      type="button"
                      onClick={() => setFormaPagamento('Parcelado')}
                      className={cn(
                        'flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all',
                        formaPagamento === 'Parcelado'
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border bg-card hover:border-primary/40'
                      )}
                    >
                      <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', formaPagamento === 'Parcelado' ? 'bg-primary/10' : 'bg-muted')}>
                        <CreditCard className={cn('h-4 w-4', formaPagamento === 'Parcelado' ? 'text-primary' : 'text-muted-foreground')} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Parcelar</p>
                        <p className="text-xs text-muted-foreground">Em até 12×</p>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">Sem juros</Badge>
                    </button>
                  </div>

                  {/* Aviso saldo insuficiente */}
                  {formaPagamento === 'Carteira' && !carteiraLoading && !saldoSuficiente && (
                    <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-700 dark:text-red-400">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>
                        Saldo insuficiente.{' '}
                        <button onClick={() => navigate('/carteira')} className="font-medium underline">
                          Adicione saldo
                        </button>{' '}
                        ou escolha parcelar.
                      </span>
                    </div>
                  )}

                  {/* Picker de parcelas */}
                  {formaPagamento === 'Parcelado' && (
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <p className="text-sm font-medium">Número de parcelas</p>
                        <Select value={String(parcelas)} onValueChange={v => setParcelas(Number(v))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PARCELAS_OPTIONS.map(n => (
                              <SelectItem key={n} value={String(n)}>
                                {n}× de {formatBRL(total / n)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="rounded-lg border border-primary/15 bg-primary/5 px-4 py-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground">
                            {parcelas} parcela{parcelas > 1 ? 's' : ''} de{' '}
                            <span className="font-bold text-foreground">{formatBRL(valorParcela)}</span>
                          </p>
                          <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                            Sem juros
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">Total: {formatBRL(total)}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* ── Coluna direita (sticky) ── */}
          <aside className="h-fit space-y-4 lg:sticky lg:top-28">

            {/* Saldo — para Anual */}
            {!isMensal && (
              <Card>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                        <Wallet className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Carteira Digital</p>
                        <p className="text-xs text-muted-foreground">Pagamento à vista</p>
                      </div>
                    </div>
                    {carteiraLoading ? <Skeleton className="h-5 w-20" /> : (
                      <span className={cn('text-sm font-bold', saldoSuficiente ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400')}>
                        {formatBRL(saldo)}
                      </span>
                    )}
                  </div>
                  {!carteiraLoading && !saldoSuficiente && (
                    <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-700 dark:text-red-400">
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>
                        Saldo insuficiente.{' '}
                        <button onClick={() => navigate('/carteira')} className="font-medium underline">Adicionar saldo.</button>
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Resumo do pedido */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Resumo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatBRL(total)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Contratação</span>
                  <Badge variant="outline" className="text-xs font-semibold">{contratacao}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Pagamento</span>
                  <span className="text-right font-medium">
                    {isParcelado
                      ? `${parcelas}× de ${formatBRL(valorParcela)}`
                      : 'Carteira digital'
                    }
                  </span>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="font-bold">Total</span>
                  <span className="text-xl font-black text-primary">{formatBRL(total)}</span>
                </div>

                {usuario && (
                  <p className="text-xs text-muted-foreground">
                    Pedido para <span className="font-medium text-foreground">{usuario.nome}</span>
                  </p>
                )}
              </CardContent>
            </Card>

            <Button
              className="h-12 w-full text-base font-semibold"
              onClick={handleConfirm}
              disabled={loading || (formaPagamento === 'Carteira' && !saldoSuficiente && !carteiraLoading)}
            >
              <CheckCircle2 className="h-5 w-5" />
              {loading
                ? 'Processando...'
                : isParcelado
                  ? `Confirmar — ${parcelas}× de ${formatBRL(valorParcela)}`
                  : 'Confirmar Pedido'
              }
            </Button>
          </aside>
        </div>
      </main>
    </div>
  )
}
