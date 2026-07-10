import { useEffect, useState } from 'react'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AdminLayout } from '@/layouts/AdminLayout'
import { carteiraApi } from '@/api/carteira'
import type { Carteira, PagedResult } from '@/types'
import { toast } from 'sonner'

export function CarteirasPage() {
  const [result, setResult] = useState<PagedResult<Carteira> | null>(null)
  const [minha, setMinha] = useState<Carteira | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Carteira | null>(null)
  const [saldo, setSaldo] = useState('')
  const [cupom, setCupom] = useState('')
  const [saving, setSaving] = useState(false)

  // Minha carteira top-up
  const [minhaSaldo, setMinhaSaldo] = useState('')
  const [minhaCupom, setMinhaCupom] = useState('')
  const [savingMinha, setSavingMinha] = useState(false)

  function load() {
    setLoading(true)
    Promise.allSettled([
      carteiraApi.list(1, 50),
      carteiraApi.minha(),
    ]).then(([listRes, minhaRes]) => {
      if (listRes.status === 'fulfilled') setResult(listRes.value)
      if (minhaRes.status === 'fulfilled') setMinha(minhaRes.value)
    }).finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function handleAdminUpdate() {
    if (!editing) return
    setSaving(true)
    try {
      const valor = parseFloat(saldo)
      if (isNaN(valor) || valor < 0) { toast.error('Valor inválido.'); return }
      const updated = await carteiraApi.update(editing.id, valor, cupom || undefined)
      setResult(prev => prev ? {
        ...prev,
        items: prev.items.map(c => c.id === updated.id ? updated : c),
      } : prev)
      toast.success('Carteira atualizada.')
      setEditing(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao atualizar')
    } finally {
      setSaving(false)
    }
  }

  async function handleMinhaTopUp() {
    const valor = parseFloat(minhaSaldo)
    if (isNaN(valor) || valor <= 0) { toast.error('Informe um valor válido.'); return }
    setSavingMinha(true)
    try {
      const updated = await carteiraApi.updateMinha(valor, minhaCupom || undefined)
      setMinha(updated)
      setMinhaSaldo('')
      setMinhaCupom('')
      toast.success('Saldo adicionado!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao adicionar saldo')
    } finally {
      setSavingMinha(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Carteiras</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie carteiras e saldos</p>
        </div>

        <Tabs defaultValue="todas">
          <TabsList>
            <TabsTrigger value="todas">Todas as carteiras</TabsTrigger>
            <TabsTrigger value="minha">Minha carteira</TabsTrigger>
          </TabsList>

          <TabsContent value="todas" className="mt-4">
            <Card>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-4 space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 rounded" />)}
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {result?.items.map(c => (
                      <div key={c.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{c.usuario_nome}</p>
                          <p className="text-xs text-muted-foreground">{c.usuario_email}</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-bold text-primary">
                            {c.saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => { setEditing(c); setSaldo(String(c.saldo)); setCupom('') }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="minha" className="mt-4">
            <div className="max-w-sm space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Saldo atual</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <Skeleton className="h-10 w-32" />
                  ) : (
                    <p className="text-4xl font-bold text-primary">
                      {(minha?.saldo ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Adicionar saldo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1.5">
                    <Label>Valor (R$)</Label>
                    <Input
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="0,00"
                      value={minhaSaldo}
                      onChange={e => setMinhaSaldo(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Cupom (opcional)</Label>
                    <Input
                      placeholder="DESCONTO10"
                      value={minhaCupom}
                      onChange={e => setMinhaCupom(e.target.value)}
                    />
                  </div>
                  <Button className="w-full" onClick={handleMinhaTopUp} disabled={savingMinha}>
                    {savingMinha ? 'Processando...' : 'Confirmar'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit carteira dialog */}
      <Dialog open={!!editing} onOpenChange={open => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar carteira — {editing?.usuario_nome}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Novo saldo (R$)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={saldo}
                onChange={e => setSaldo(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Cupom (opcional)</Label>
              <Input
                placeholder="DESCONTO10"
                value={cupom}
                onChange={e => setCupom(e.target.value)}
              />
            </div>
            <Button className="w-full" onClick={handleAdminUpdate} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
