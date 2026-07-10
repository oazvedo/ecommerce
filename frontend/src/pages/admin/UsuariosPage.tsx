import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AdminLayout } from '@/layouts/AdminLayout'
import { usuariosApi } from '@/api/usuarios'
import { empresasApi } from '@/api/empresas'
import type { Usuario, Empresa, PagedResult } from '@/types'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const CARGOS = ['Operador', 'Gerente', 'Diretor', 'Administrador']

const CARGO_COLORS: Record<string, string> = {
  Administrador: 'bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/20',
  Diretor: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20',
  Gerente: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  Operador: 'bg-secondary text-secondary-foreground border-border',
}

export function UsuariosPage() {
  const navigate = useNavigate()
  const [result, setResult] = useState<PagedResult<Usuario> | null>(null)
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({ nome: '', email: '', password: '', empresaId: '', cargo: 'Operador' })
  const [saving, setSaving] = useState(false)
  const selectedEmpresa = empresas.find(e => e.empresa_id === form.empresaId)

  function load() {
    setLoading(true)
    Promise.allSettled([
      usuariosApi.list(1, 50),
      empresasApi.list(1, 100),
    ]).then(([usuResult, empResult]) => {
      if (usuResult.status === 'fulfilled') setResult(usuResult.value)
      if (empResult.status === 'fulfilled') setEmpresas(empResult.value.items)
    }).finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function handleCreate() {
    setSaving(true)
    try {
      await usuariosApi.create(
        { nome: form.nome, email: form.email, password: form.password, empresaId: form.empresaId },
        form.cargo
      )
      toast.success('Usuário criado.')
      setDialogOpen(false)
      setForm({ nome: '', email: '', password: '', empresaId: '', cargo: 'Operador' })
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao criar usuário')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Usuários</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {result ? `${result.totalCount} usuário(s)` : ''}
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Novo usuário
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 rounded" />)}
              </div>
            ) : (
              <div className="divide-y divide-border">
                {result?.items.map(u => (
                  <button
                    key={u.id}
                    className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-muted/30 transition-colors"
                    onClick={() => navigate(`/admin/usuarios/${u.id}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{u.nome}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge
                        variant="outline"
                        className={cn('text-xs', CARGO_COLORS[u.cargo] ?? CARGO_COLORS.Operador)}
                      >
                        {u.cargo}
                      </Badge>
                      <Badge
                        variant={u.status === 'Ativo' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {u.status}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Nome</Label>
              <Input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>E-mail</Label>
              <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Senha</Label>
              <Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Empresa</Label>
              <Select value={form.empresaId} onValueChange={v => setForm(f => ({ ...f, empresaId: v ?? f.empresaId }))}>
                <SelectTrigger className="w-full">
                  <span className={cn('min-w-0 flex-1 truncate text-left', !selectedEmpresa && 'text-muted-foreground')}>
                    {selectedEmpresa?.empresa_nome ?? 'Selecione...'}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {empresas.map(e => (
                    <SelectItem key={e.empresa_id} value={e.empresa_id}>{e.empresa_nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Cargo</Label>
              <Select value={form.cargo} onValueChange={v => setForm(f => ({ ...f, cargo: v ?? f.cargo }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CARGOS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={handleCreate} disabled={saving}>
              {saving ? 'Criando...' : 'Criar usuário'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
