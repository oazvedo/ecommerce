import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  ArrowUpRight,
  CalendarClock,
  CreditCard,
  Mail,
  Plus,
  ShieldCheck,
  Tag,
  User,
  WalletCards,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Navbar } from '@/components/Navbar'
import { carteiraApi } from '@/api/carteira'
import type { Carteira } from '@/types'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const QUICK_AMOUNTS = [50, 100, 250, 500]
const KNOWN_COUPONS = [
  { code: 'BONUS10', label: '+10%' },
  { code: 'BONUS20', label: '+20%' },
  { code: 'BONUS35', label: '+35%' },
]

export function WalletPage() {
  const [carteira, setCarteira] = useState<Carteira | null>(null)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [saldo, setSaldo] = useState('')
  const [cupom, setCupom] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    carteiraApi.minha().then(setCarteira).catch(console.error).finally(() => setLoading(false))
  }, [])

  async function handleTopUp() {
    const valor = parseFloat(saldo)
    if (isNaN(valor) || valor <= 0) {
      toast.error('Informe um valor válido.')
      return
    }

    setSaving(true)
    try {
      const updated = await carteiraApi.updateMinha(valor, cupom || undefined)
      setCarteira(updated)
      setOpen(false)
      setSaldo('')
      setCupom('')
      toast.success('Saldo adicionado com sucesso!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao atualizar saldo')
    } finally {
      setSaving(false)
    }
  }

  const bonus = useMemo(() => {
    const valor = parseFloat(saldo)
    if (isNaN(valor) || valor <= 0) return null
    const pct = cupom === 'BONUS10' ? 0.1 : cupom === 'BONUS20' ? 0.2 : cupom === 'BONUS35' ? 0.35 : null
    if (pct === null) return null
    return valor * (1 + pct)
  }, [cupom, saldo])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-6">
        <section className="mb-5 rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">Carteira</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight">Saldo e benefícios</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {carteira?.usuario_nome ?? 'Administrador'}
                {carteira?.usuario_email ? ` · ${carteira.usuario_email}` : ''}
              </p>
            </div>

            <Button className="h-10 gap-2 font-semibold" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" />
              Adicionar saldo
              <ArrowUpRight className="h-3.5 w-3.5 opacity-70" />
            </Button>
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="relative overflow-hidden rounded-xl border border-primary/15 bg-gradient-to-br from-white via-violet-50 to-cyan-50 p-6 text-foreground shadow-xl shadow-primary/10 dark:border-zinc-800 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900 dark:text-white dark:shadow-zinc-950/20">
            <div className="absolute inset-y-0 right-0 w-32 skew-x-[-16deg] bg-primary/15 dark:bg-primary/25" />
            <div className="absolute inset-y-0 right-20 w-10 skew-x-[-16deg] bg-cyan-400/25 dark:bg-cyan-400/20" />

            <div className="relative">
              <div className="flex items-center justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-white/10 dark:text-white">
                  <WalletCards className="h-5 w-5" />
                </div>
                <span className="rounded-lg border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary dark:border-white/15 dark:bg-white/10 dark:text-white">
                  Ativa
                </span>
              </div>

              <p className="mt-7 text-xs font-semibold uppercase tracking-widest text-muted-foreground dark:text-white/60">Saldo disponível</p>
              {loading ? (
                <Skeleton className="mt-2 h-11 w-60 bg-primary/10 dark:bg-white/15" />
              ) : (
                <p className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">
                  {formatBRL(carteira?.saldo ?? 0)}
                </p>
              )}

              <div className="mt-7 grid gap-3 text-sm text-muted-foreground dark:text-white/75 sm:grid-cols-2">
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary/70 dark:text-white/50" />
                  {carteira?.usuario_nome ?? '--'}
                </span>
                <span className="flex min-w-0 items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0 text-primary/70 dark:text-white/50" />
                  <span className="truncate">{carteira?.usuario_email ?? '--'}</span>
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Cupons</p>
                <h2 className="mt-2 text-lg font-semibold">Bônus disponíveis</h2>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                <Tag className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-4 grid gap-2.5">
              {KNOWN_COUPONS.map(coupon => (
                <button
                  key={coupon.code}
                  onClick={() => {
                    setCupom(coupon.code)
                    setOpen(true)
                  }}
                  className="flex items-center justify-between rounded-lg border border-border bg-background px-3.5 py-2.5 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  <span>
                    <span className="block text-sm font-semibold text-foreground">{coupon.code}</span>
                    <span className="text-xs text-muted-foreground">Cupom de recarga</span>
                  </span>
                  <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    {coupon.label}
                  </span>
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <WalletMetric
            icon={<CreditCard className="h-4 w-4" />}
            label="Saldo atual"
            value={loading ? null : formatBRL(carteira?.saldo ?? 0)}
          />
          <WalletMetric
            icon={<CalendarClock className="h-4 w-4" />}
            label="Atualizado em"
            value={loading ? null : formatDate(carteira?.atualizado_em ?? carteira?.criado_em)}
          />
          <WalletMetric
            icon={<ShieldCheck className="h-4 w-4" />}
            label="Conta"
            value={loading ? null : 'Verificada'}
          />
        </div>
      </main>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Adicionar saldo</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-1">
            <div>
              <Label className="mb-2 block text-xs text-muted-foreground">Valor rápido</Label>
              <div className="grid grid-cols-4 gap-2">
                {QUICK_AMOUNTS.map(v => (
                  <button
                    key={v}
                    onClick={() => setSaldo(String(v))}
                    className={cn(
                      'rounded-lg border px-2 py-2 text-sm font-semibold transition-colors',
                      saldo === String(v)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-background hover:border-primary/50 hover:bg-primary/5'
                    )}
                  >
                    R$ {v}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="valor">Valor (R$)</Label>
              <Input
                id="valor"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0,00"
                value={saldo}
                onChange={e => setSaldo(e.target.value)}
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cupom" className="flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" />
                Cupom de bônus
              </Label>
              <Input
                id="cupom"
                placeholder="BONUS10 · BONUS20 · BONUS35"
                value={cupom}
                onChange={e => setCupom(e.target.value.toUpperCase())}
                className="h-11 font-mono tracking-wide"
              />
            </div>

            {bonus !== null && (
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2.5 text-sm">
                <p className="font-medium text-emerald-700 dark:text-emerald-300">
                  Você receberá{' '}
                  <span className="font-black">
                    {formatBRL(bonus)}
                  </span>
                </p>
              </div>
            )}

            <Button className="h-11 w-full" onClick={handleTopUp} disabled={saving}>
              {saving ? 'Processando...' : 'Confirmar depósito'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function WalletMetric({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string | null
}) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-4 shadow-sm">
      <div className="mb-2 flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs font-semibold">{label}</span>
      </div>
      {value === null ? <Skeleton className="h-6 w-28" /> : <p className="text-lg font-black">{value}</p>}
    </div>
  )
}

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return '--'
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}
