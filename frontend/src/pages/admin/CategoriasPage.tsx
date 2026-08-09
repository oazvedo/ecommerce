import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Plus, Pencil } from 'lucide-react'
import { AdminLayout } from '@/layouts/AdminLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { categoriasApi } from '@/api/categorias'
import type { CategoriaProduto, PagedResult } from '@/types'

export function CategoriasPage() {
  const [result, setResult] = useState<PagedResult<CategoriaProduto> | null>(null)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<CategoriaProduto | null>(null)
  const [nome, setNome] = useState('')
  const [ativo, setAtivo] = useState(true)
  const [saving, setSaving] = useState(false)

  function load() {
    setLoading(true)
    categoriasApi.list(1, 100).then(setResult).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(load, [])

  function openCreate() {
    setEditing(null)
    setNome('')
    setAtivo(true)
    setDialogOpen(true)
  }

  function openEdit(c: CategoriaProduto) {
    setEditing(c)
    setNome(c.nome)
    setAtivo(c.ativo)
    setDialogOpen(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      if (editing) {
        await categoriasApi.update(editing.id, { nome, ativo })
        toast.success('Categoria atualizada.')
      } else {
        await categoriasApi.create(nome)
        toast.success('Categoria criada.')
      }
      setDialogOpen(false)
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar categoria.')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleAtivo(c: CategoriaProduto) {
    try {
      await categoriasApi.update(c.id, { nome: c.nome, ativo: !c.ativo })
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao atualizar categoria.')
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Categorias de produto</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {result ? `${result.totalCount} categoria(s)` : ''}
            </p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nova categoria
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 rounded" />)}
              </div>
            ) : result?.items.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">Nenhuma categoria cadastrada ainda.</p>
            ) : (
              <div className="divide-y divide-border">
                {result?.items.map(c => (
                  <div key={c.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
                    <p className="flex-1 min-w-0 font-medium truncate">{c.nome}</p>
                    <Badge variant={c.ativo ? 'default' : 'secondary'} className="text-xs">
                      {c.ativo ? 'Ativa' : 'Inativa'}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => handleToggleAtivo(c)}>
                      {c.ativo ? 'Desativar' : 'Ativar'}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)}>
                      <Pencil className="h-4 w-4 text-violet-500" />
                    </Button>
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
            <DialogTitle>{editing ? 'Editar categoria' : 'Nova categoria'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Nome</Label>
              <Input value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Eletrônicos" />
            </div>
            {editing && (
              <div className="flex items-center justify-between">
                <Label>Ativa</Label>
                <Switch checked={ativo} onCheckedChange={setAtivo} />
              </div>
            )}
            <Button className="w-full" onClick={handleSave} disabled={saving || !nome.trim()}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
