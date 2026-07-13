import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Pencil, Plus, Trash2, UserPlus, UserRoundPlus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { empresasApi } from '@/api/empresas'
import { produtosApi, type ProdutoPayload } from '@/api/produtos'
import { usuariosApi } from '@/api/usuarios'
import type { Empresa, Produto, Usuario, PagedResult } from '@/types'
import { toast } from 'sonner'

const TIPOS = ['Central', 'Filial', 'Parceira', 'Representante']
const CARGOS = ['Operador', 'Gerente', 'Diretor', 'Administrador']

const EMPTY_USUARIO = { nome: '', email: '', password: '', cargo: 'Operador' }

const EMPTY_PRODUTO: ProdutoPayload = { nome: '', descricao: '', preco: 0, codigo: '', status: true }

interface EmpresaForm {
  nome: string
  cnpj: string
  telefone: string
  tipo: string
  status: boolean
}

export function EmpresaDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [empresa, setEmpresa] = useState<Empresa | null>(null)
  const [loadingEmpresa, setLoadingEmpresa] = useState(true)

  // Edit empresa dialog
  const [editOpen, setEditOpen] = useState(false)
  const [editForm, setEditForm] = useState<EmpresaForm>({ nome: '', cnpj: '', telefone: '', tipo: 'Central', status: true })
  const [saving, setSaving] = useState(false)

  // Produtos tab
  const [produtos, setProdutos] = useState<PagedResult<Produto> | null>(null)
  const [loadingProdutos, setLoadingProdutos] = useState(true)
  const [produtoDialogOpen, setProdutoDialogOpen] = useState(false)
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null)
  const [produtoForm, setProdutoForm] = useState<ProdutoPayload>(EMPTY_PRODUTO)
  const [savingProduto, setSavingProduto] = useState(false)
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null)

  // Usuários tab
  const [usuarios, setUsuarios] = useState<PagedResult<Usuario> | null>(null)
  const [loadingUsuarios, setLoadingUsuarios] = useState(true)
  const [addUserOpen, setAddUserOpen] = useState(false)
  const [allUsers, setAllUsers] = useState<Usuario[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string>('')
  const [addingUser, setAddingUser] = useState(false)
  const [createUserOpen, setCreateUserOpen] = useState(false)
  const [createUserForm, setCreateUserForm] = useState(EMPTY_USUARIO)
  const [creatingUser, setCreatingUser] = useState(false)

  function loadEmpresa() {
    if (!id) return
    setLoadingEmpresa(true)
    empresasApi.get(id)
      .then(setEmpresa)
      .catch(() => toast.error('Erro ao carregar empresa'))
      .finally(() => setLoadingEmpresa(false))
  }

  function loadProdutos() {
    if (!id) return
    setLoadingProdutos(true)
    empresasApi.getProdutos(id, 1, 50)
      .then(setProdutos)
      .catch(console.error)
      .finally(() => setLoadingProdutos(false))
  }

  function loadUsuarios() {
    if (!id) return
    setLoadingUsuarios(true)
    empresasApi.getUsuarios(id, 1, 50)
      .then(setUsuarios)
      .catch(console.error)
      .finally(() => setLoadingUsuarios(false))
  }

  useEffect(() => {
    loadEmpresa()
    loadProdutos()
    loadUsuarios()
  }, [id])

  function openEditEmpresa() {
    if (!empresa) return
    setEditForm({
      nome: empresa.empresa_nome,
      cnpj: empresa.empresa_cnpj,
      telefone: empresa.empresa_telefone,
      tipo: empresa.empresa_tipo,
      status: empresa.empresa_status,
    })
    setEditOpen(true)
  }

  async function handleSaveEmpresa() {
    if (!id || !empresa) return
    setSaving(true)
    try {
      await empresasApi.update(id, {
        nome: editForm.nome,
        cnpj: editForm.cnpj,
        telefone: editForm.telefone,
        tipo: editForm.tipo,
        status: editForm.status,
        responsavel: empresa.empresa_responsavel,
        responsavel_id: empresa.empresa_responsavel_id,
      })
      toast.success('Empresa atualizada.')
      setEditOpen(false)
      loadEmpresa()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  // Produto handlers
  function openCreateProduto() {
    setEditingProduto(null)
    setProdutoForm(EMPTY_PRODUTO)
    setProdutoDialogOpen(true)
  }

  function openEditProduto(p: Produto) {
    setEditingProduto(p)
    setProdutoForm({ nome: p.nome, descricao: p.descricao, preco: p.preco, codigo: p.codigo, status: p.status })
    setProdutoDialogOpen(true)
  }

  async function handleSaveProduto() {
    setSavingProduto(true)
    try {
      if (editingProduto) {
        await produtosApi.update(editingProduto.id, produtoForm)
        toast.success('Produto atualizado.')
      } else {
        await produtosApi.create(produtoForm)
        toast.success('Produto criado.')
      }
      setProdutoDialogOpen(false)
      loadProdutos()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar produto')
    } finally {
      setSavingProduto(false)
    }
  }

  async function handleDeleteProduto() {
    if (!deleteProductId) return
    try {
      await produtosApi.delete(deleteProductId)
      toast.success('Produto removido.')
      setDeleteProductId(null)
      loadProdutos()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao remover produto')
    }
  }

  // Usuário handlers
  async function openAddUser() {
    const result = await usuariosApi.list(1, 200)
    const currentIds = new Set(usuarios?.items.map(u => u.id) ?? [])
    setAllUsers(result.items.filter(u => !currentIds.has(u.id)))
    setSelectedUserId('')
    setAddUserOpen(true)
  }

  async function handleAddUser() {
    if (!id || !selectedUserId) return
    setAddingUser(true)
    try {
      await empresasApi.adicionarUsuario(id, selectedUserId)
      toast.success('Usuário adicionado à empresa.')
      setAddUserOpen(false)
      loadUsuarios()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao adicionar usuário')
    } finally {
      setAddingUser(false)
    }
  }

  async function handleCreateUser() {
    if (!id) return
    setCreatingUser(true)
    try {
      await usuariosApi.create(
        { nome: createUserForm.nome, email: createUserForm.email, password: createUserForm.password, empresaId: id },
        createUserForm.cargo
      )
      toast.success('Usuário criado e vinculado à empresa.')
      setCreateUserOpen(false)
      setCreateUserForm(EMPTY_USUARIO)
      loadUsuarios()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao criar usuário')
    } finally {
      setCreatingUser(false)
    }
  }

  if (loadingEmpresa) {
    return (
      <AdminLayout>
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-24 rounded-lg" />
        </div>
      </AdminLayout>
    )
  }

  if (!empresa) {
    return (
      <AdminLayout>
        <div className="text-center py-12 text-muted-foreground">Empresa não encontrada.</div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" className="mt-0.5 shrink-0" onClick={() => navigate('/admin/empresas')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold truncate">{empresa.empresa_nome}</h1>
              <Badge variant={empresa.empresa_status ? 'default' : 'secondary'}>
                {empresa.empresa_status ? 'Ativo' : 'Inativo'}
              </Badge>
              <Badge variant="outline">{empresa.empresa_tipo}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              CNPJ: {empresa.empresa_cnpj} · {empresa.empresa_telefone}
            </p>
            <p className="text-xs text-muted-foreground">
              Responsável: {empresa.empresa_responsavel}
            </p>
          </div>
          <Button variant="outline" onClick={openEditEmpresa} className="shrink-0">
            <Pencil className="mr-2 h-4 w-4" />
            Editar empresa
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="usuarios">
          <TabsList>
            <TabsTrigger value="usuarios">
              Usuários {usuarios ? `(${usuarios.totalCount})` : ''}
            </TabsTrigger>
            <TabsTrigger value="produtos">
              Produtos {produtos ? `(${produtos.totalCount})` : ''}
            </TabsTrigger>
          </TabsList>

          {/* Usuários tab */}
          <TabsContent value="usuarios" className="mt-4">
            <div className="space-y-4">
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={openAddUser}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Adicionar existente
                </Button>
                <Button onClick={() => { setCreateUserForm(EMPTY_USUARIO); setCreateUserOpen(true) }}>
                  <UserRoundPlus className="mr-2 h-4 w-4" />
                  Novo usuário
                </Button>
              </div>
              <Card>
                <CardContent className="p-0">
                  {loadingUsuarios ? (
                    <div className="p-4 space-y-3">
                      {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 rounded" />)}
                    </div>
                  ) : usuarios?.items.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">Nenhum usuário nesta empresa.</p>
                  ) : (
                    <div className="divide-y divide-border">
                      {usuarios?.items.map(u => (
                        <div key={u.id} className="flex items-center justify-between px-4 py-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{u.nome}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge variant="outline" className="text-xs">{u.cargo}</Badge>
                            <Badge
                              variant={u.status === 'Ativo' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {u.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Produtos tab */}
          <TabsContent value="produtos" className="mt-4">
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button onClick={openCreateProduto}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo produto
                </Button>
              </div>
              <Card>
                <CardContent className="p-0">
                  {loadingProdutos ? (
                    <div className="p-4 space-y-3">
                      {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 rounded" />)}
                    </div>
                  ) : produtos?.items.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">Nenhum produto nesta empresa.</p>
                  ) : (
                    <div className="divide-y divide-border">
                      {produtos?.items.map(p => (
                        <div key={p.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{p.nome}</p>
                            <p className="text-xs text-muted-foreground font-mono">{p.codigo} · {p.descricao}</p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-sm font-semibold">
                              {p.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                            <Badge variant={p.status ? 'default' : 'secondary'} className="text-xs">
                              {p.status ? 'Ativo' : 'Inativo'}
                            </Badge>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditProduto(p)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:bg-destructive/10"
                              onClick={() => setDeleteProductId(p.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create user dialog */}
      <Dialog open={createUserOpen} onOpenChange={setCreateUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo usuário — {empresa?.empresa_nome}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Nome</Label>
              <Input
                value={createUserForm.nome}
                onChange={e => setCreateUserForm(f => ({ ...f, nome: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>E-mail</Label>
              <Input
                type="email"
                value={createUserForm.email}
                onChange={e => setCreateUserForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Senha</Label>
              <Input
                type="password"
                value={createUserForm.password}
                onChange={e => setCreateUserForm(f => ({ ...f, password: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Cargo</Label>
              <Select value={createUserForm.cargo} onValueChange={v => setCreateUserForm(f => ({ ...f, cargo: v ?? f.cargo }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CARGOS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full"
              onClick={handleCreateUser}
              disabled={creatingUser || !createUserForm.nome || !createUserForm.email || !createUserForm.password}
            >
              {creatingUser ? 'Criando...' : 'Criar usuário'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit empresa dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar empresa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Nome</Label>
              <Input value={editForm.nome} onChange={e => setEditForm(f => ({ ...f, nome: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>CNPJ</Label>
              <Input value={editForm.cnpj} onChange={e => setEditForm(f => ({ ...f, cnpj: e.target.value }))} placeholder="00.000.000/0001-00" />
            </div>
            <div className="space-y-1.5">
              <Label>Telefone</Label>
              <Input value={editForm.telefone} onChange={e => setEditForm(f => ({ ...f, telefone: e.target.value }))} placeholder="(11) 99999-9999" />
            </div>
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={editForm.tipo} onValueChange={v => setEditForm(f => ({ ...f, tipo: v ?? f.tipo }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIPOS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Ativo</Label>
              <Switch checked={editForm.status} onCheckedChange={v => setEditForm(f => ({ ...f, status: v }))} />
            </div>
            <Button className="w-full" onClick={handleSaveEmpresa} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add user dialog */}
      <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar usuário à empresa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Selecionar usuário</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um usuário..." />
                </SelectTrigger>
                <SelectContent>
                  {allUsers.map(u => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.nome} — {u.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {allUsers.length === 0 && (
                <p className="text-xs text-muted-foreground">Todos os usuários já estão nesta empresa.</p>
              )}
            </div>
            <Button className="w-full" onClick={handleAddUser} disabled={addingUser || !selectedUserId}>
              {addingUser ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Produto form dialog */}
      <Dialog open={produtoDialogOpen} onOpenChange={setProdutoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProduto ? 'Editar produto' : 'Novo produto'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
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
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={produtoForm.preco}
                  onChange={e => setProdutoForm(f => ({ ...f, preco: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Ativo</Label>
              <Switch checked={produtoForm.status} onCheckedChange={v => setProdutoForm(f => ({ ...f, status: v }))} />
            </div>
            <Button className="w-full" onClick={handleSaveProduto} disabled={savingProduto}>
              {savingProduto ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete product confirmation */}
      <AlertDialog open={!!deleteProductId} onOpenChange={open => !open && setDeleteProductId(null)}>
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
    </AdminLayout>
  )
}
