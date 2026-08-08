import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
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
import { AdminLayout } from '@/layouts/AdminLayout'
import { ProdutoFormDialog } from '@/components/ProdutoFormDialog'
import { resolveImageUrl } from '@/api/upload'
import { produtosApi } from '@/api/produtos'
import type { Produto, PagedResult } from '@/types'
import { toast } from 'sonner'

export function ProdutosAdminPage() {
  const [result, setResult] = useState<PagedResult<Produto> | null>(null)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editing, setEditing] = useState<Produto | null>(null)

  function load() {
    setLoading(true)
    produtosApi.list(1, 50).then(setResult).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(load, [])

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }

  function openEdit(p: Produto) {
    setEditing(p)
    setDialogOpen(true)
  }

  function handleProdutoSaved(produto: Produto) {
    setResult(prev => {
      if (!prev) return prev
      const exists = prev.items.some(p => p.id === produto.id)
      return {
        ...prev,
        items: exists
          ? prev.items.map(p => p.id === produto.id ? produto : p)
          : [produto, ...prev.items],
        totalCount: exists ? prev.totalCount : prev.totalCount + 1,
      }
    })
  }

  async function handleDelete() {
    if (!deleteId) return
    try {
      await produtosApi.delete(deleteId)
      toast.success('Produto removido.')
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
            <h1 className="text-2xl font-bold">Produtos</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {result ? `${result.totalCount} produto(s)` : ''}
            </p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Novo produto
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
                {result?.items.map(p => (
                  <div key={p.id} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
                    {p.imagemUrl
                      ? <img src={resolveImageUrl(p.imagemUrl)!} alt={p.nome} className="h-10 w-10 rounded-lg object-cover shrink-0" />
                      : <div className="h-10 w-10 rounded-lg bg-muted shrink-0" />
                    }
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{p.nome}</p>
                      <p className="text-xs text-muted-foreground font-mono">{p.codigo}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-semibold">
                        {p.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                      {p.estoque === 0 ? (
                        <Badge variant="destructive" className="text-xs">Sem estoque</Badge>
                      ) : p.estoque <= 10 ? (
                        <Badge className="text-xs border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400">{p.estoque} unid.</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">{p.estoque} unid.</Badge>
                      )}
                      <Badge
                        variant={p.status ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {p.status ? 'Ativo' : 'Inativo'}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(p)}>
                            <Pencil className="mr-2 h-4 w-4 text-violet-500" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeleteId(p.id)}
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

      <ProdutoFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        produto={editing}
        onCreate={payload => produtosApi.create(payload)}
        onUpdate={(id, payload) => produtosApi.update(id, payload)}
        onSaved={handleProdutoSaved}
      />

      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover produto?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
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
