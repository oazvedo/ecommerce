import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { Produto } from '@/types'
import { produtosApi, type ProdutoPayload } from '@/api/produtos'
import { resolveImageUrl } from '@/api/upload'
import { ImageUpload } from '@/components/ImageUpload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const EMPTY_FORM: ProdutoPayload = {
  nome: '',
  descricao: '',
  preco: 0,
  codigo: '',
  status: true,
  estoque: 0,
  freteGratis: false,
  variantes: null,
  categoria: null,
}

function toPayload(p: Produto): ProdutoPayload {
  return {
    nome: p.nome,
    descricao: p.descricao,
    preco: p.preco,
    codigo: p.codigo,
    status: p.status,
    estoque: p.estoque,
    freteGratis: p.freteGratis,
    variantes: p.variantes,
    categoria: p.categoria,
  }
}

interface ProdutoFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Produto sendo editado, ou null para criar um novo. */
  produto: Produto | null
  onCreate: (payload: ProdutoPayload) => Promise<Produto>
  onUpdate: (id: string, payload: ProdutoPayload) => Promise<Produto>
  /** Chamado após criar ou atualizar, para o pai refletir a mudança na lista. */
  onSaved: (produto: Produto) => void
}

export function ProdutoFormDialog({ open, onOpenChange, produto, onCreate, onUpdate, onSaved }: ProdutoFormDialogProps) {
  const [form, setForm] = useState<ProdutoPayload>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  // Produto já persistido nesta sessão do modal — habilita o upload de foto
  // tanto ao editar um produto existente quanto logo após criar um novo.
  const [savedProduto, setSavedProduto] = useState<Produto | null>(null)
  const [categorias, setCategorias] = useState<string[]>([])

  useEffect(() => {
    if (!open) return
    setForm(produto ? toPayload(produto) : EMPTY_FORM)
    setSavedProduto(produto)
    // Sugestões de categorias já usadas, pra lojista reaproveitar em vez de criar variações.
    produtosApi.categorias().then(setCategorias).catch(() => {})
  }, [open, produto])

  const isNewlyCreated = !produto && !!savedProduto

  async function handleSave() {
    setSaving(true)
    try {
      if (savedProduto) {
        const updated = await onUpdate(savedProduto.id, form)
        toast.success('Produto atualizado.')
        setSavedProduto(updated)
        onSaved(updated)
        onOpenChange(false)
      } else {
        const created = await onCreate(form)
        toast.success('Produto criado! Agora você pode adicionar uma foto.')
        setSavedProduto(created)
        onSaved(created)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar produto.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{produto ? 'Editar produto' : 'Novo produto'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          {savedProduto && (
            <div className="flex justify-center">
              <ImageUpload
                entidade="produto"
                id={savedProduto.id}
                currentUrl={resolveImageUrl(savedProduto.imagemUrl)}
                variant="produto"
                onSuccess={url => {
                  const updated = { ...savedProduto, imagemUrl: url }
                  setSavedProduto(updated)
                  onSaved(updated)
                }}
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label>Nome</Label>
            <Input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>Descrição</Label>
            <Input value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Código</Label>
              <Input value={form.codigo} onChange={e => setForm(f => ({ ...f, codigo: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Preço (R$)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.preco}
                onChange={e => setForm(f => ({ ...f, preco: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Estoque</Label>
              <Input
                type="number"
                min="0"
                value={form.estoque}
                onChange={e => setForm(f => ({ ...f, estoque: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Variantes</Label>
              <Input
                placeholder="Ex: Azul, Preto, 128GB"
                value={form.variantes ?? ''}
                onChange={e => setForm(f => ({ ...f, variantes: e.target.value || null }))}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Categoria</Label>
            <Input
              list="categorias-produto"
              placeholder="Ex: Eletrônicos"
              value={form.categoria ?? ''}
              onChange={e => setForm(f => ({ ...f, categoria: e.target.value || null }))}
            />
            <datalist id="categorias-produto">
              {categorias.map(c => <option key={c} value={c} />)}
            </datalist>
          </div>
          <div className="flex items-center justify-between">
            <Label>Ativo</Label>
            <Switch checked={form.status} onCheckedChange={v => setForm(f => ({ ...f, status: v }))} />
          </div>
          <div className="flex items-center justify-between">
            <Label>Frete grátis</Label>
            <Switch checked={form.freteGratis} onCheckedChange={v => setForm(f => ({ ...f, freteGratis: v }))} />
          </div>
          <Button
            className="w-full"
            onClick={handleSave}
            disabled={saving || !form.nome || !form.codigo}
          >
            {saving ? 'Salvando...' : isNewlyCreated ? 'Concluir' : 'Salvar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
