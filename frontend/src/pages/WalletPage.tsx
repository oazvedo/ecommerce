import { useState, useEffect } from 'react'
import { Plus, Tag, User, Mail, ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Navbar } from '@/components/Navbar'
import { carteiraApi } from '@/api/carteira'
import type { Carteira } from '@/types'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const QUICK_AMOUNTS = [50, 100, 250, 500]
const KNOWN_COUPONS = ['BONUS10', 'BONUS20', 'BONUS35']

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
    if (isNaN(valor) || valor <= 0) { toast.error('Informe um valor válido.'); return }
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

  function previewBonus(): number | null {
    const valor = parseFloat(saldo)
    if (isNaN(valor) || valor <= 0) return null
    const pct = cupom === 'BONUS10' ? 0.1 : cupom === 'BONUS20' ? 0.2 : cupom === 'BONUS35' ? 0.35 : null
    if (pct === null) return null
    return valor * (1 + pct)
  }

  const bonus = previewBonus()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-lg px-4 py-8 space-y-4">

        {/* Balance card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-violet-800 p-6 text-white shadow-xl shadow-purple-900/30">
          {/* Decorative circles */}
          <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-10 -left-6 h-32 w-32 rounded-full bg-white/5" />

          <div className="relative">
            <p className="text-xs font-medium uppercase tracking-widest text-purple-200 mb-1">Saldo disponível</p>

            {loading ? (
              <div className="h-12 w-48 animate-pulse rounded-lg bg-white/20 mt-1" />
            ) : (
              <p className="text-5xl font-black tabular-nums leading-none mt-1">
                {(carteira?.saldo ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            )}

            {carteira && (
              <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-purple-100">
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 opacity-70" />
                  {carteira.usuario_nome}
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 opacity-70" />
                  {carteira.usuario_email}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Add funds button */}
        <Button className="w-full h-11 font-semibold gap-2" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Adicionar saldo
          <ArrowUpRight className="h-3.5 w-3.5 opacity-70" />
        </Button>

        {/* Coupons hint */}
        <div className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-3">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2">
            <Tag className="h-3.5 w-3.5" />
            Cupons disponíveis
          </p>
          <div className="flex flex-wrap gap-2">
            {KNOWN_COUPONS.map(c => (
              <button
                key={c}
                onClick={() => { setCupom(c); setOpen(true) }}
                className="rounded-md bg-primary/10 border border-primary/20 px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
              >
                {c}
              </button>
            ))}
          </div>
        </div>

      </main>

      {/* Add funds dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Adicionar saldo</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-1">
            {/* Quick amounts */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Valor rápido</Label>
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
              <Label htmlFor="valor">Ou digite o valor (R$)</Label>
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

            {/* Preview */}
            {bonus !== null && (
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2.5 text-sm">
                <p className="text-emerald-600 dark:text-emerald-400 font-medium">
                  Você receberá{' '}
                  <span className="font-bold">
                    {bonus.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                  {' '}com o bônus aplicado
                </p>
              </div>
            )}

            <Button className="w-full h-11" onClick={handleTopUp} disabled={saving}>
              {saving ? 'Processando...' : 'Confirmar depósito'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
