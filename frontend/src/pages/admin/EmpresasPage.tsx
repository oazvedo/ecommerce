import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, MoreHorizontal, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { ImageUpload } from '@/components/ImageUpload'
import { resolveImageUrl } from '@/api/upload'
import { empresasApi } from '@/api/empresas'
import type { Empresa, PagedResult } from '@/types'
import { toast } from 'sonner'

const TIPOS = ['Central', 'Filial', 'Parceira', 'Representante']

interface EmpresaForm {
  nome: string
  cnpj: string
  telefone: string
  tipo: string
  status: boolean
}

const EMPTY_FORM: EmpresaForm = { nome: '', cnpj: '', telefone: '', tipo: 'Central', status: true }

export function EmpresasPage() {
  const navigate = useNavigate()
  const [result, setResult] = useState<PagedResult<Empresa> | null>(null)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editing, setEditing] = useState<Empresa | null>(null)
  const [form, setForm] = useState<EmpresaForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  function load() {
    setLoading(true)
    empresasApi.list(1, 50).then(setResult).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(load, [])

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  function openEdit(e: Empresa) {
    setEditing(e)
    setForm({
      nome: e.empresa_nome,
      cnpj: e.empresa_cnpj,
      telefone: e.empresa_telefone,
      tipo: e.empresa_tipo,
      status: e.empresa_status,
    })
    setDialogOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      if (editing) {
        await empresasApi.update(editing.empresa_id, {
          nome: form.nome,
          cnpj: form.cnpj,
          telefone: form.telefone,
          tipo: form.tipo,
          status: form.status,
          responsavel: editing.empresa_responsavel,
          responsavel_id: editing.empresa_responsavel_id,
        })
        toast.success('Empresa atualizada.')
      } else {
        await empresasApi.create(form)
        toast.success('Empresa criada.')
      }
      setDialogOpen(false)
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    try {
      await empresasApi.delete(deleteId)
      toast.success('Empresa removida.')
      setDeleteId(null)
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao remover')
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Empresas</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {result ? `${result.totalCount} empresa(s)` : ''}
            </p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nova empresa
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
                {result?.items.map(e => (
                  <div key={e.empresa_id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
                    {e.empresa_logo_url
                      ? <img src={resolveImageUrl(e.empresa_logo_url)!} alt="logo" className="h-9 w-9 rounded-lg object-cover shrink-0" />
                      : <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0 text-xs font-bold text-muted-foreground">{e.empresa_nome.charAt(0)}</div>
                    }
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{e.empresa_nome}</p>
                      <p className="text-xs text-muted-foreground">{e.empresa_cnpj} · {e.empresa_telefone}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className="text-xs">{e.empresa_tipo}</Badge>
                      <Badge variant={e.empresa_status ? 'default' : 'secondary'} className="text-xs">
                        {e.empresa_status ? 'Ativo' : 'Inativo'}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/admin/empresa/${e.empresa_id}`)}>
                            <ExternalLink className="mr-2 h-4 w-4 text-blue-500" />
                            Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEdit(e)}>
                            <Pencil className="mr-2 h-4 w-4 text-violet-500" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeleteId(e.empresa_id)}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar empresa' : 'Nova empresa'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {editing && (
              <div className="flex justify-center">
                <ImageUpload
                  entidade="empresa"
                  id={editing.empresa_id}
                  currentUrl={resolveImageUrl(editing.empresa_logo_url)}
                  variant="logo"
                  onSuccess={url => setResult(prev => prev ? {
                    ...prev,
                    items: prev.items.map(e => e.empresa_id === editing.empresa_id ? { ...e, empresa_logo_url: url } : e)
                  } : prev)}
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Nome</Label>
              <Input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>CNPJ</Label>
              <Input value={form.cnpj} onChange={e => setForm(f => ({ ...f, cnpj: e.target.value }))} placeholder="00.000.000/0001-00" />
            </div>
            <div className="space-y-1.5">
              <Label>Telefone</Label>
              <Input value={form.telefone} onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))} placeholder="(11) 99999-9999" />
            </div>
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={form.tipo} onValueChange={v => setForm(f => ({ ...f, tipo: v ?? f.tipo }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIPOS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Ativo</Label>
              <Switch checked={form.status} onCheckedChange={v => setForm(f => ({ ...f, status: v }))} />
            </div>
            <Button className="w-full" onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover empresa?</AlertDialogTitle>
            <AlertDialogDescription>
              Todos os produtos, pedidos e usuários associados serão afetados. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  )
}
