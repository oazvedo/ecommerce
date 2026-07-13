import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { empresasApi } from '@/api/empresas'
import { usuariosApi } from '@/api/usuarios'
import type { Empresa, Usuario, PagedResult } from '@/types'
import { Navbar } from '@/components/Navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { Building2, Phone, Hash, Pencil, KeyRound, UserX, PowerOff, Power, MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

const TIPOS = ['Central', 'Filial', 'Parceira', 'Representante']
const CARGOS = ['Operador', 'Gerente', 'Diretor', 'Administrador']

interface UsuarioEditForm {
  nome: string
  email: string
  cargo: string
}

export function MinhaEmpresaPage() {
  const { empresaId, hasPermission, usuario: me } = useAuth()

  const [empresa, setEmpresa] = useState<Empresa | null>(null)
  const [usuarios, setUsuarios] = useState<PagedResult<Usuario> | null>(null)
  const [loading, setLoading] = useState(true)

  // Edit empresa
  const [editEmpresaOpen, setEditEmpresaOpen] = useState(false)
  const [empresaForm, setEmpresaForm] = useState({ nome: '', cnpj: '', telefone: '', tipo: 'Central', status: true })
  const [savingEmpresa, setSavingEmpresa] = useState(false)

  // Edit usuário
  const [editUsuarioOpen, setEditUsuarioOpen] = useState(false)
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null)
  const [usuarioForm, setUsuarioForm] = useState<UsuarioEditForm>({ nome: '', email: '', cargo: 'Operador' })
  const [savingUsuario, setSavingUsuario] = useState(false)

  // Reset senha
  const [resetSenhaOpen, setResetSenhaOpen] = useState(false)
  const [resetTarget, setResetTarget] = useState<Usuario | null>(null)
  const [novaSenha, setNovaSenha] = useState('')
  const [savingSenha, setSavingSenha] = useState(false)

  // Desalocar
  const [desalocarTarget, setDesalocarTarget] = useState<Usuario | null>(null)

  const canEditEmpresa = hasPermission('Empresa.Update')
  const canEditUsuario = hasPermission('Usuario.Update')
  const canResetSenha = hasPermission('Usuario.PasswordUpdate')

  function load() {
    if (!empresaId) return
    setLoading(true)
    Promise.all([
      empresasApi.get(empresaId),
      empresasApi.getUsuarios(empresaId, 1, 50),
    ])
      .then(([emp, usrs]) => {
        setEmpresa(emp)
        setUsuarios(usrs)
      })
      .catch(() => toast.error('Erro ao carregar dados da empresa'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [empresaId])

  // ── Empresa ──────────────────────────────────────────
  function openEditEmpresa() {
    if (!empresa) return
    setEmpresaForm({
      nome: empresa.empresa_nome,
      cnpj: empresa.empresa_cnpj,
      telefone: empresa.empresa_telefone,
      tipo: empresa.empresa_tipo,
      status: empresa.empresa_status,
    })
    setEditEmpresaOpen(true)
  }

  async function handleSaveEmpresa() {
    if (!empresaId || !empresa) return
    setSavingEmpresa(true)
    try {
      await empresasApi.update(empresaId, {
        ...empresaForm,
        responsavel: empresa.empresa_responsavel,
        responsavel_id: empresa.empresa_responsavel_id,
      })
      toast.success('Empresa atualizada.')
      setEditEmpresaOpen(false)
      load()
    } catch {
      toast.error('Erro ao salvar empresa.')
    } finally {
      setSavingEmpresa(false)
    }
  }

  // ── Usuário: editar ───────────────────────────────────
  function openEditUsuario(u: Usuario) {
    setEditingUsuario(u)
    setUsuarioForm({ nome: u.nome, email: u.email, cargo: u.cargo })
    setEditUsuarioOpen(true)
  }

  async function handleSaveUsuario() {
    if (!editingUsuario) return
    setSavingUsuario(true)
    try {
      await usuariosApi.update(editingUsuario.id, {
        nome: usuarioForm.nome,
        email: usuarioForm.email,
        cargo: usuarioForm.cargo,
      })
      toast.success('Usuário atualizado.')
      setEditUsuarioOpen(false)
      load()
    } catch {
      toast.error('Erro ao atualizar usuário.')
    } finally {
      setSavingUsuario(false)
    }
  }

  // ── Usuário: status ───────────────────────────────────
  async function handleToggleStatus(u: Usuario) {
    const novoStatus = u.status === 'Ativo' ? 'Desativado' : 'Ativo'
    try {
      await usuariosApi.updateStatus(u.id, novoStatus)
      toast.success(`Usuário ${novoStatus === 'Ativo' ? 'ativado' : 'desativado'}.`)
      load()
    } catch {
      toast.error('Erro ao alterar status.')
    }
  }

  // ── Usuário: senha ────────────────────────────────────
  function openResetSenha(u: Usuario) {
    setResetTarget(u)
    setNovaSenha('')
    setResetSenhaOpen(true)
  }

  async function handleResetSenha() {
    if (!resetTarget || !novaSenha) return
    setSavingSenha(true)
    try {
      await usuariosApi.updatePassword(resetTarget.id, novaSenha)
      toast.success('Senha redefinida.')
      setResetSenhaOpen(false)
    } catch {
      toast.error('Erro ao redefinir senha.')
    } finally {
      setSavingSenha(false)
    }
  }

  // ── Usuário: desalocar ────────────────────────────────
  async function handleDesalocar() {
    if (!desalocarTarget || !empresaId) return
    try {
      await empresasApi.desalocarUsuario(empresaId, desalocarTarget.id)
      toast.success(`${desalocarTarget.nome} desalocado da empresa.`)
      setDesalocarTarget(null)
      load()
    } catch {
      toast.error('Erro ao desalocar usuário.')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold">Minha Empresa</h1>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        ) : !empresa ? (
          <p className="text-muted-foreground">Empresa não encontrada.</p>
        ) : (
          <>
            {/* Card da empresa */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{empresa.empresa_nome}</CardTitle>
                      <p className="text-sm text-muted-foreground">{empresa.empresa_tipo}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={empresa.empresa_status ? 'default' : 'secondary'}>
                      {empresa.empresa_status ? 'Ativo' : 'Inativo'}
                    </Badge>
                    {canEditEmpresa && (
                      <Button variant="outline" size="sm" onClick={openEditEmpresa}>
                        <Pencil className="mr-1.5 h-3.5 w-3.5" />
                        Editar
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Hash className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">CNPJ:</span>
                  <span className="font-mono">{empresa.empresa_cnpj}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">Telefone:</span>
                  <span>{empresa.empresa_telefone}</span>
                </div>
              </CardContent>
            </Card>

            {/* Lista de usuários */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Usuários ({usuarios?.totalCount ?? 0})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {usuarios?.items.length === 0 ? (
                  <p className="px-6 py-4 text-sm text-muted-foreground">Nenhum usuário nesta empresa.</p>
                ) : (
                  <div className="divide-y divide-border">
                    {usuarios?.items.map(u => {
                      const isMe = u.id === me?.id
                      return (
                        <div key={u.id} className="flex items-center justify-between px-4 py-3 gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {u.nome} {isMe && <span className="text-xs text-muted-foreground">(você)</span>}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge variant="outline" className="text-xs">{u.cargo}</Badge>
                            <Badge variant={u.status === 'Ativo' ? 'default' : 'secondary'} className="text-xs">
                              {u.status}
                            </Badge>
                            {!isMe && (canEditUsuario || canResetSenha) && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {canEditUsuario && (
                                    <DropdownMenuItem onClick={() => openEditUsuario(u)}>
                                      <Pencil className="mr-2 h-4 w-4 text-violet-500" />
                                      Editar
                                    </DropdownMenuItem>
                                  )}
                                  {canResetSenha && (
                                    <DropdownMenuItem onClick={() => openResetSenha(u)}>
                                      <KeyRound className="mr-2 h-4 w-4 text-orange-500" />
                                      Redefinir senha
                                    </DropdownMenuItem>
                                  )}
                                  {canEditUsuario && (
                                    <DropdownMenuItem onClick={() => handleToggleStatus(u)}>
                                      {u.status === 'Ativo'
                                        ? <PowerOff className="mr-2 h-4 w-4 text-amber-500" />
                                        : <Power className="mr-2 h-4 w-4 text-emerald-500" />}
                                      {u.status === 'Ativo' ? 'Desativar' : 'Ativar'}
                                    </DropdownMenuItem>
                                  )}
                                  {canEditUsuario && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() => setDesalocarTarget(u)}
                                        className="text-destructive focus:text-destructive"
                                      >
                                        <UserX className="mr-2 h-4 w-4" />
                                        Desalocar da empresa
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>

      {/* Dialog: editar empresa */}
      <Dialog open={editEmpresaOpen} onOpenChange={setEditEmpresaOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar empresa</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Nome</Label>
              <Input value={empresaForm.nome} onChange={e => setEmpresaForm(f => ({ ...f, nome: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>CNPJ</Label>
              <Input value={empresaForm.cnpj} onChange={e => setEmpresaForm(f => ({ ...f, cnpj: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Telefone</Label>
              <Input value={empresaForm.telefone} onChange={e => setEmpresaForm(f => ({ ...f, telefone: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={empresaForm.tipo} onValueChange={v => setEmpresaForm(f => ({ ...f, tipo: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TIPOS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Ativo</Label>
              <Switch checked={empresaForm.status} onCheckedChange={v => setEmpresaForm(f => ({ ...f, status: v }))} />
            </div>
            <Button className="w-full" onClick={handleSaveEmpresa} disabled={savingEmpresa}>
              {savingEmpresa ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: editar usuário */}
      <Dialog open={editUsuarioOpen} onOpenChange={setEditUsuarioOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar usuário</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Nome</Label>
              <Input value={usuarioForm.nome} onChange={e => setUsuarioForm(f => ({ ...f, nome: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>E-mail</Label>
              <Input type="email" value={usuarioForm.email} onChange={e => setUsuarioForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Cargo</Label>
              <Select value={usuarioForm.cargo} onValueChange={v => setUsuarioForm(f => ({ ...f, cargo: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CARGOS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={handleSaveUsuario} disabled={savingUsuario}>
              {savingUsuario ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: reset senha */}
      <Dialog open={resetSenhaOpen} onOpenChange={setResetSenhaOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redefinir senha — {resetTarget?.nome}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Nova senha</Label>
              <Input
                type="password"
                value={novaSenha}
                onChange={e => setNovaSenha(e.target.value)}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <Button className="w-full" onClick={handleResetSenha} disabled={savingSenha || novaSenha.length < 6}>
              {savingSenha ? 'Salvando...' : 'Redefinir senha'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmação: desalocar */}
      <AlertDialog open={!!desalocarTarget} onOpenChange={open => !open && setDesalocarTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desalocar {desalocarTarget?.nome}?</AlertDialogTitle>
            <AlertDialogDescription>
              O usuário será removido desta empresa e movido para a empresa padrão do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDesalocar} className="bg-destructive hover:bg-destructive/90">
              Desalocar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
