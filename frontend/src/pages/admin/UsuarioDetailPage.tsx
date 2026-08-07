import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, X, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AdminLayout } from '@/layouts/AdminLayout'
import { usuariosApi } from '@/api/usuarios'
import { permissoesApi } from '@/api/permissoes'
import type { Usuario, Permissao } from '@/types'
import { toast } from 'sonner'

export function UsuarioDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [assigned, setAssigned] = useState<Permissao[]>([])
  const [allPerms, setAllPerms] = useState<Permissao[]>([])
  const [loading, setLoading] = useState(true)

  const [pwDialogOpen, setPwDialogOpen] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [savingPw, setSavingPw] = useState(false)

  function load() {
    if (!id) return
    setLoading(true)
    Promise.allSettled([
      usuariosApi.get(id),
      permissoesApi.byUsuario(id),
      permissoesApi.list(),
    ]).then(([uRes, aRes, allRes]) => {
      if (uRes.status === 'fulfilled') setUsuario(uRes.value)
      if (aRes.status === 'fulfilled') setAssigned(aRes.value)
      if (allRes.status === 'fulfilled') setAllPerms(allRes.value.items)
    }).finally(() => setLoading(false))
  }

  useEffect(load, [id])

  async function handleAssign(perm: Permissao) {
    if (!id) return
    try {
      await permissoesApi.assign(id, perm.id)
      setAssigned(prev => [...prev, perm])
      toast.success(`Permissão "${perm.nome}" atribuída.`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao atribuir')
    }
  }

  async function handleRemove(perm: Permissao) {
    if (!id) return
    try {
      await permissoesApi.remove(id, perm.id)
      setAssigned(prev => prev.filter(p => p.id !== perm.id))
      toast.success(`Permissão "${perm.nome}" removida.`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao remover')
    }
  }

  async function handleChangePassword() {
    if (!id || !newPassword) return
    setSavingPw(true)
    try {
      await usuariosApi.updatePassword(id, newPassword)
      toast.success('Senha alterada.')
      setPwDialogOpen(false)
      setNewPassword('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao alterar senha')
    } finally {
      setSavingPw(false)
    }
  }

  const available = allPerms.filter(p => !assigned.some(a => a.id === p.id))

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </AdminLayout>
    )
  }

  if (!usuario) {
    return (
      <AdminLayout>
        <p className="text-muted-foreground">Usuário não encontrado.</p>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-2xl">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin/usuarios')}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Voltar
        </Button>

        {/* User info */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{usuario.nome}</CardTitle>
                <p className="text-sm text-muted-foreground mt-0.5">{usuario.email}</p>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline">{usuario.cargo}</Badge>
                <Badge variant={usuario.status === 'Ativo' ? 'default' : 'secondary'}>
                  {usuario.status}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" onClick={() => setPwDialogOpen(true)}>
              <KeyRound className="mr-2 h-4 w-4" />
              Alterar senha
            </Button>
          </CardContent>
        </Card>

        {/* Permissions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Permissões atribuídas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {assigned.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma permissão atribuída.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {assigned.map(p => (
                  <Badge key={p.id} variant="secondary" className="gap-1.5 pl-2.5 pr-1.5 py-1">
                    {p.nome}
                    <button
                      onClick={() => handleRemove(p)}
                      className="rounded-full hover:bg-destructive/20 transition-colors p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {available.length > 0 && (
              <>
                <Separator />
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Adicionar permissão</p>
                <div className="flex flex-wrap gap-2">
                  {available.map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleAssign(p)}
                      className="flex items-center gap-1.5 rounded-full border border-dashed border-border px-2.5 py-1 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                      {p.nome}
                    </button>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Change password dialog */}
      <Dialog open={pwDialogOpen} onOpenChange={setPwDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar senha</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Nova senha</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <Button className="w-full" onClick={handleChangePassword} disabled={savingPw}>
              {savingPw ? 'Salvando...' : 'Confirmar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
