import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { empresasApi } from '@/api/empresas'
import { usuariosApi } from '@/api/usuarios'
import { produtosApi, type ProdutoPayload } from '@/api/produtos'
import type { Empresa, Usuario, Produto, PagedResult } from '@/types'
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
import { Building2, Phone, Hash, Pencil, KeyRound, UserX, PowerOff, Power, MoreHorizontal, Store, Plus, ChevronRight, ArrowLeft, UserPlus, Package, Trash2 } from 'lucide-react'
import { ImageUpload } from '@/components/ImageUpload'
import { resolveImageUrl } from '@/api/upload'
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
const EMPTY_PRODUTO: ProdutoPayload = { nome: '', descricao: '', preco: 0, codigo: '', status: true, estoque: 0, freteGratis: false, variantes: null }

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

interface UsuarioEditForm {
  nome: string
  email: string
  cargo: string
}

export function MinhaEmpresaPage() {
  const { empresaId, hasPermission, usuario: me } = useAuth()
  const { id: routeId } = useParams<{ id: string }>()
  // Gerencia a própria empresa por padrão, ou uma filial quando a rota traz :id.
  const targetId = routeId ?? empresaId
  const isFilialView = !!routeId && routeId !== empresaId

  const [empresa, setEmpresa] = useState<Empresa | null>(null)
  const [usuarios, setUsuarios] = useState<PagedResult<Usuario> | null>(null)
  const [filiais, setFiliais] = useState<PagedResult<Empresa> | null>(null)
  const [loading, setLoading] = useState(true)

  // Criar filial
  const [createFilialOpen, setCreateFilialOpen] = useState(false)
  const [filialForm, setFilialForm] = useState({ nome: '', cnpj: '', telefone: '', status: true })
  const [savingFilial, setSavingFilial] = useState(false)

  // Adicionar usuário
  const [createUsuarioOpen, setCreateUsuarioOpen] = useState(false)
  const [novoUsuarioForm, setNovoUsuarioForm] = useState({ nome: '', email: '', password: '', cargo: 'Operador' })
  const [savingNovoUsuario, setSavingNovoUsuario] = useState(false)

  // Produtos
  const [produtos, setProdutos] = useState<PagedResult<Produto> | null>(null)
  const [produtoDialogOpen, setProdutoDialogOpen] = useState(false)
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null)
  const [produtoForm, setProdutoForm] = useState<ProdutoPayload>(EMPTY_PRODUTO)
  const [savingProduto, setSavingProduto] = useState(false)
  const [deleteProdutoId, setDeleteProdutoId] = useState<string | null>(null)

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
  const canCreateProduto = hasPermission('Produto.Create')
  const canEditProduto = hasPermission('Produto.Update')
  const canDeleteProduto = hasPermission('Produto.Delete')

  function load() {
    if (!targetId) return
    setLoading(true)
    Promise.all([
      empresasApi.get(targetId),
      empresasApi.getUsuarios(targetId, 1, 50),
      empresasApi.getFiliais(targetId, 1, 50),
      produtosApi.list(1, 50, { empresaId: targetId }),
    ])
      .then(([emp, usrs, fils, prods]) => {
        setEmpresa(emp)
        setUsuarios(usrs)
        setFiliais(fils)
        setProdutos(prods)
      })
      .catch(() => toast.error('Erro ao carregar dados da empresa'))
      .finally(() => setLoading(false))
  }

  useEffect(load, [targetId])

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
    if (!targetId || !empresa) return
    setSavingEmpresa(true)
    try {
      await empresasApi.update(targetId, {
        ...empresaForm,
        responsavel: empresa.empresa_responsavel,
        responsavel_id: empresa.empresa_responsavel_id,
        empresa_pai_id: empresa.empresa_pai_id,
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

  // ── Filial: criar ─────────────────────────────────────
  async function handleCreateFilial() {
    if (!targetId) return
    setSavingFilial(true)
    try {
      await empresasApi.createFilial(targetId, filialForm)
      toast.success('Filial criada.')
      setCreateFilialOpen(false)
      setFilialForm({ nome: '', cnpj: '', telefone: '', status: true })
      load()
    } catch {
      toast.error('Erro ao criar filial.')
    } finally {
      setSavingFilial(false)
    }
  }

  // ── Usuário: criar ────────────────────────────────────
  async function handleCreateUsuario() {
    if (!targetId) return
    if (novoUsuarioForm.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.')
      return
    }
    setSavingNovoUsuario(true)
    try {
      await empresasApi.criarUsuario(targetId, novoUsuarioForm)
      toast.success('Usuário adicionado.')
      setCreateUsuarioOpen(false)
      setNovoUsuarioForm({ nome: '', email: '', password: '', cargo: 'Operador' })
      load()
    } catch {
      toast.error('Erro ao adicionar usuário.')
    } finally {
      setSavingNovoUsuario(false)
    }
  }

  // ── Produtos ──────────────────────────────────────────
  function openCreateProduto() {
    setEditingProduto(null)
    setProdutoForm(EMPTY_PRODUTO)
    setProdutoDialogOpen(true)
  }

  function openEditProduto(p: Produto) {
    setEditingProduto(p)
    setProdutoForm({ nome: p.nome, descricao: p.descricao, preco: p.preco, codigo: p.codigo, status: p.status, estoque: p.estoque, freteGratis: p.freteGratis, variantes: p.variantes })
    setProdutoDialogOpen(true)
  }

  async function handleSaveProduto() {
    if (!targetId) return
    setSavingProduto(true)
    try {
      if (editingProduto) {
        await produtosApi.update(editingProduto.id, produtoForm)
        toast.success('Produto atualizado.')
      } else {
        await empresasApi.criarProduto(targetId, produtoForm)
        toast.success('Produto criado.')
      }
      setProdutoDialogOpen(false)
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar produto.')
    } finally {
      setSavingProduto(false)
    }
  }

  async function handleDeleteProduto() {
    if (!deleteProdutoId) return
    try {
      await produtosApi.delete(deleteProdutoId)
      toast.success('Produto removido.')
      setDeleteProdutoId(null)
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao remover produto.')
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
    if (!desalocarTarget || !targetId) return
    try {
      await empresasApi.desalocarUsuario(targetId, desalocarTarget.id)
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
        {isFilialView && (
          <Button variant="ghost" size="sm" asChild className="-ml-2">
            <Link to="/minha-empresa">
              <ArrowLeft className="h-4 w-4" />
              Voltar à minha empresa
            </Link>
          </Button>
        )}
        <h1 className="text-2xl font-bold">{isFilialView ? 'Gerenciar filial' : 'Minha Empresa'}</h1>

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
                    {resolveImageUrl(empresa.empresa_logo_url)
                      ? <img src={resolveImageUrl(empresa.empresa_logo_url)!} alt="logo" className="h-10 w-10 rounded-lg object-cover shrink-0" />
                      : <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                          <Building2 className="h-5 w-5" />
                        </div>
                    }
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
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-base">
                    Usuários ({usuarios?.totalCount ?? 0})
                  </CardTitle>
                  {canEditEmpresa && (
                    <Button variant="outline" size="sm" onClick={() => setCreateUsuarioOpen(true)}>
                      <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                      Adicionar usuário
                    </Button>
                  )}
                </div>
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

            {/* Produtos da loja */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-base">
                    Produtos ({produtos?.totalCount ?? 0})
                  </CardTitle>
                  {canCreateProduto && (
                    <Button variant="outline" size="sm" onClick={openCreateProduto}>
                      <Plus className="mr-1.5 h-3.5 w-3.5" />
                      Novo produto
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {(produtos?.items.length ?? 0) === 0 ? (
                  <p className="px-6 py-4 text-sm text-muted-foreground">Nenhum produto nesta loja.</p>
                ) : (
                  <div className="divide-y divide-border">
                    {produtos?.items.map(p => (
                      <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                        {resolveImageUrl(p.imagemUrl)
                          ? <img src={resolveImageUrl(p.imagemUrl)!} alt={p.nome} className="h-10 w-10 rounded-lg object-cover shrink-0" />
                          : <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0"><Package className="h-4 w-4" /></div>
                        }
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{p.nome}</p>
                          <p className="text-xs text-muted-foreground font-mono truncate">{p.codigo}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-sm font-semibold">{formatBRL(p.preco)}</span>
                          {p.estoque === 0 ? (
                            <Badge variant="destructive" className="text-xs">Sem estoque</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">{p.estoque} un.</Badge>
                          )}
                          <Badge variant={p.status ? 'default' : 'secondary'} className="text-xs">
                            {p.status ? 'Ativo' : 'Pausado'}
                          </Badge>
                          {(canEditProduto || canDeleteProduto) && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {canEditProduto && (
                                  <DropdownMenuItem onClick={() => openEditProduto(p)}>
                                    <Pencil className="mr-2 h-4 w-4 text-violet-500" />
                                    Editar
                                  </DropdownMenuItem>
                                )}
                                {canDeleteProduto && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => setDeleteProdutoId(p.id)}
                                      className="text-destructive focus:text-destructive"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Excluir
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Filiais — só faz sentido gerenciar a partir de uma central (não numa filial) */}
            {!isFilialView && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="text-base">
                      Filiais ({filiais?.totalCount ?? 0})
                    </CardTitle>
                    {canEditEmpresa && (
                      <Button variant="outline" size="sm" onClick={() => setCreateFilialOpen(true)}>
                        <Plus className="mr-1.5 h-3.5 w-3.5" />
                        Nova filial
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {(filiais?.items.length ?? 0) === 0 ? (
                    <p className="px-6 py-4 text-sm text-muted-foreground">Nenhuma filial vinculada.</p>
                  ) : (
                    <div className="divide-y divide-border">
                      {filiais?.items.map(f => (
                        <Link
                          key={f.empresa_id}
                          to={`/minha-empresa/${f.empresa_id}`}
                          className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {resolveImageUrl(f.empresa_logo_url)
                              ? <img src={resolveImageUrl(f.empresa_logo_url)!} alt="logo" className="h-9 w-9 rounded-lg object-cover shrink-0" />
                              : <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                                  <Store className="h-4 w-4" />
                                </div>
                            }
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{f.empresa_nome}</p>
                              <p className="text-xs text-muted-foreground truncate">{f.empresa_cnpj}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge variant={f.empresa_status ? 'default' : 'secondary'} className="text-xs">
                              {f.empresa_status ? 'Ativo' : 'Inativo'}
                            </Badge>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>

      {/* Dialog: editar empresa */}
      <Dialog open={editEmpresaOpen} onOpenChange={setEditEmpresaOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar empresa</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            {empresa && (
              <div className="flex justify-center">
                <ImageUpload
                  entidade="empresa"
                  id={empresa.empresa_id}
                  currentUrl={resolveImageUrl(empresa.empresa_logo_url)}
                  variant="logo"
                  onSuccess={url => setEmpresa(e => e ? { ...e, empresa_logo_url: url } : e)}
                />
              </div>
            )}
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

      {/* Dialog: criar filial */}
      <Dialog open={createFilialOpen} onOpenChange={setCreateFilialOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova filial</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Nome</Label>
              <Input value={filialForm.nome} onChange={e => setFilialForm(f => ({ ...f, nome: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>CNPJ</Label>
              <Input value={filialForm.cnpj} onChange={e => setFilialForm(f => ({ ...f, cnpj: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Telefone</Label>
              <Input value={filialForm.telefone} onChange={e => setFilialForm(f => ({ ...f, telefone: e.target.value }))} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Ativo</Label>
              <Switch checked={filialForm.status} onCheckedChange={v => setFilialForm(f => ({ ...f, status: v }))} />
            </div>
            <Button
              className="w-full"
              onClick={handleCreateFilial}
              disabled={savingFilial || !filialForm.nome || !filialForm.cnpj}
            >
              {savingFilial ? 'Criando...' : 'Criar filial'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: adicionar usuário */}
      <Dialog open={createUsuarioOpen} onOpenChange={setCreateUsuarioOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Adicionar usuário</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Nome</Label>
              <Input value={novoUsuarioForm.nome} onChange={e => setNovoUsuarioForm(f => ({ ...f, nome: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>E-mail</Label>
              <Input type="email" value={novoUsuarioForm.email} onChange={e => setNovoUsuarioForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Senha</Label>
              <Input
                type="password"
                value={novoUsuarioForm.password}
                onChange={e => setNovoUsuarioForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Mínimo 6 caracteres"
                aria-invalid={novoUsuarioForm.password.length > 0 && novoUsuarioForm.password.length < 6}
              />
              {novoUsuarioForm.password.length > 0 && novoUsuarioForm.password.length < 6 && (
                <p className="text-xs text-destructive">A senha deve ter pelo menos 6 caracteres.</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Cargo</Label>
              <Select value={novoUsuarioForm.cargo} onValueChange={v => setNovoUsuarioForm(f => ({ ...f, cargo: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['Operador', 'Gerente', 'Diretor'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full"
              onClick={handleCreateUsuario}
              disabled={savingNovoUsuario || !novoUsuarioForm.nome || !novoUsuarioForm.email || novoUsuarioForm.password.length < 6}
            >
              {savingNovoUsuario ? 'Adicionando...' : 'Adicionar usuário'}
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
                aria-invalid={novaSenha.length > 0 && novaSenha.length < 6}
              />
              {novaSenha.length > 0 && novaSenha.length < 6 && (
                <p className="text-xs text-destructive">A senha deve ter pelo menos 6 caracteres.</p>
              )}
            </div>
            <Button className="w-full" onClick={handleResetSenha} disabled={savingSenha || novaSenha.length < 6}>
              {savingSenha ? 'Salvando...' : 'Redefinir senha'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: criar/editar produto */}
      <Dialog open={produtoDialogOpen} onOpenChange={setProdutoDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingProduto ? 'Editar produto' : 'Novo produto'}</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            {editingProduto && (
              <div className="flex justify-center">
                <ImageUpload
                  entidade="produto"
                  id={editingProduto.id}
                  currentUrl={resolveImageUrl(editingProduto.imagemUrl)}
                  variant="produto"
                  onSuccess={url => setProdutos(prev => prev ? {
                    ...prev,
                    items: prev.items.map(p => p.id === editingProduto.id ? { ...p, imagemUrl: url } : p)
                  } : prev)}
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Nome</Label>
              <Input value={produtoForm.nome} onChange={e => setProdutoForm(f => ({ ...f, nome: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Descrição</Label>
              <Input value={produtoForm.descricao} onChange={e => setProdutoForm(f => ({ ...f, descricao: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Código</Label>
                <Input value={produtoForm.codigo} onChange={e => setProdutoForm(f => ({ ...f, codigo: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Preço (R$)</Label>
                <Input type="number" min="0" step="0.01" value={produtoForm.preco}
                  onChange={e => setProdutoForm(f => ({ ...f, preco: parseFloat(e.target.value) || 0 }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Estoque</Label>
                <Input type="number" min="0" value={produtoForm.estoque}
                  onChange={e => setProdutoForm(f => ({ ...f, estoque: parseInt(e.target.value) || 0 }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Variantes</Label>
                <Input placeholder="Ex: Azul, Preto, 128GB" value={produtoForm.variantes ?? ''}
                  onChange={e => setProdutoForm(f => ({ ...f, variantes: e.target.value || null }))} />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Ativo</Label>
              <Switch checked={produtoForm.status} onCheckedChange={v => setProdutoForm(f => ({ ...f, status: v }))} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Frete grátis</Label>
              <Switch checked={produtoForm.freteGratis} onCheckedChange={v => setProdutoForm(f => ({ ...f, freteGratis: v }))} />
            </div>
            <Button className="w-full" onClick={handleSaveProduto} disabled={savingProduto || !produtoForm.nome || !produtoForm.codigo}>
              {savingProduto ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmação: excluir produto */}
      <AlertDialog open={!!deleteProdutoId} onOpenChange={open => !open && setDeleteProdutoId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover produto?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduto} className="bg-destructive hover:bg-destructive/90">
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
