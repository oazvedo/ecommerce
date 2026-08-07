import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, MoreHorizontal, Power, PowerOff, ExternalLink } from 'lucide-react'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AdminLayout } from '@/layouts/AdminLayout'
import { ImageUpload } from '@/components/ImageUpload'
import { resolveImageUrl } from '@/api/upload'
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

type EditForm = { nome: string; email: string; cargo: string }

export function UsuariosPage() {
  const navigate = useNavigate()
  const [result, setResult] = useState<PagedResult<Usuario> | null>(null)
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)

  const [createOpen, setCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState({ nome: '', email: '', password: '', empresaId: '', cargo: 'Operador' })
  const [creating, setCreating] = useState(false)
  const selectedEmpresa = empresas.find(e => e.empresa_id === createForm.empresaId)

  const [editTarget, setEditTarget] = useState<Usuario | null>(null)
  const [editForm, setEditForm] = useState<EditForm>({ nome: '', email: '', cargo: '' })
  const [saving, setSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState<Usuario | null>(null)
  const [deleting, setDeleting] = useState(false)

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

  function openEdit(u: Usuario) {
    setEditTarget(u)
    setEditForm({ nome: u.nome, email: u.email, cargo: u.cargo })
  }

  async function handleCreate() {
    setCreating(true)
    try {
      await usuariosApi.create(
        { nome: createForm.nome, email: createForm.email, password: createForm.password, empresaId: createForm.empresaId },
        createForm.cargo
      )
      toast.success('Usuário criado.')
      setCreateOpen(false)
      setCreateForm({ nome: '', email: '', password: '', empresaId: '', cargo: 'Operador' })
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao criar usuário')
    } finally {
      setCreating(false)
    }
  }

  async function handleEdit() {
    if (!editTarget) return
    setSaving(true)
    try {
      await usuariosApi.update(editTarget.id, editForm)
      toast.success('Usuário atualizado.')
      setEditTarget(null)
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao atualizar')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleStatus(u: Usuario) {
    const next = u.status === 'Ativo' ? 'Desativado' : 'Ativo'
    try {
      await usuariosApi.updateStatus(u.id, next)
      toast.success(`Usuário ${next === 'Ativo' ? 'ativado' : 'desativado'}.`)
      setResult(prev => prev ? {
        ...prev,
        items: prev.items.map(x => x.id === u.id ? { ...x, status: next } : x),
      } : prev)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao alterar status')
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await usuariosApi.delete(deleteTarget.id)
      toast.success('Usuário excluído.')
      setDeleteTarget(null)
      load()
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
            <h1 className="text-2xl font-bold">Usuários</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {result ? `${result.totalCount} usuário(s)` : ''}
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
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
                  <div key={u.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
                    {u.foto_url
                      ? <img src={resolveImageUrl(u.foto_url)!} alt={u.nome} className="h-9 w-9 rounded-full object-cover shrink-0" />
                      : <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0 text-xs font-bold text-muted-foreground">{u.nome.charAt(0).toUpperCase()}</div>
                    }
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{u.nome}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className={cn('text-xs', CARGO_COLORS[u.cargo] ?? CARGO_COLORS.Operador)}>
                        {u.cargo}
                      </Badge>
                      <Badge variant={u.status === 'Ativo' ? 'default' : 'secondary'} className="text-xs">
                        {u.status}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/admin/usuarios/${u.id}`)}>
                            <ExternalLink className="mr-2 h-4 w-4 text-blue-500" />
                            Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEdit(u)}>
                            <Pencil className="mr-2 h-4 w-4 text-violet-500" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(u)}>
                            {u.status === 'Ativo'
                              ? <PowerOff className="mr-2 h-4 w-4 text-amber-500" />
                              : <Power className="mr-2 h-4 w-4 text-emerald-500" />}
                            {u.status === 'Ativo' ? 'Desativar' : 'Ativar'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeleteTarget(u)}
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
      </div>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Nome</Label>
              <Input value={createForm.nome} onChange={e => setCreateForm(f => ({ ...f, nome: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>E-mail</Label>
              <Input type="email" value={createForm.email} onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Senha</Label>
              <Input type="password" value={createForm.password} onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Empresa</Label>
              <Select value={createForm.empresaId} onValueChange={v => setCreateForm(f => ({ ...f, empresaId: v ?? f.empresaId }))}>
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
              <Select value={createForm.cargo} onValueChange={v => setCreateForm(f => ({ ...f, cargo: v ?? f.cargo }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CARGOS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={handleCreate} disabled={creating}>
              {creating ? 'Criando...' : 'Criar usuário'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editTarget} onOpenChange={open => !open && setEditTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {editTarget && (
              <div className="flex justify-center">
                <ImageUpload
                  entidade="usuario"
                  id={editTarget.id}
                  currentUrl={resolveImageUrl(editTarget.foto_url)}
                  variant="avatar"
                  onSuccess={url => setResult(prev => prev ? {
                    ...prev,
                    items: prev.items.map(u => u.id === editTarget.id ? { ...u, foto_url: url } : u)
                  } : prev)}
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Nome</Label>
              <Input value={editForm.nome} onChange={e => setEditForm(f => ({ ...f, nome: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>E-mail</Label>
              <Input type="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Cargo</Label>
              <Select value={editForm.cargo} onValueChange={v => setEditForm(f => ({ ...f, cargo: v ?? f.cargo }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CARGOS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={handleEdit} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir usuário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir <strong>{deleteTarget?.nome}</strong>? Esta ação não pode ser desfeita.
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
