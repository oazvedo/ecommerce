import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import type {
  CategoriaProduto,
  Produto,
  ProdutoContratacaoPermitida,
  ProdutoTipo,
} from '@/types'
import { MAX_PARCELAS_LIMITE } from '@/types'
import type { ProdutoPayload } from '@/api/produtos'
import { categoriasApi } from '@/api/categorias'
import { resolveImageUrl } from '@/api/upload'
import { ImageUpload } from '@/components/ImageUpload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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

const SEM_CATEGORIA = 'sem-categoria'

const TIPOS: { value: ProdutoTipo; label: string }[] = [
  { value: 'Fisico', label: 'Físico (bem)' },
  { value: 'Servico', label: 'Serviço (assinatura)' },
]

const CONTRATACOES: { value: ProdutoContratacaoPermitida; label: string }[] = [
  { value: 'Ambas', label: 'Mensal e anual' },
  { value: 'Mensal', label: 'Somente mensal' },
  { value: 'Anual', label: 'Somente anual' },
]

const EMPTY_FORM: ProdutoPayload = {
  nome: '',
  descricao: '',
  preco: 0,
  codigo: '',
  status: true,
  estoque: 0,
  freteGratis: false,
  variantes: null,
  categoriaId: null,
  tipo: 'Fisico',
  contratacaoPermitida: 'Ambas',
  maxParcelas: 1,
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
    categoriaId: p.categoriaId,
    tipo: p.tipo,
    contratacaoPermitida: p.contratacaoPermitida,
    maxParcelas: p.maxParcelas,
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
  const [categorias, setCategorias] = useState<CategoriaProduto[]>([])

  useEffect(() => {
    if (!open) return
    setForm(produto ? toPayload(produto) : EMPTY_FORM)
    setSavedProduto(produto)
    // Categorias cadastradas pelo admin — lojista só escolhe entre as ativas.
    categoriasApi.list(1, 200, true).then(r => setCategorias(r.items)).catch(() => {})
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
            <Label htmlFor="produto-nome">Nome</Label>
            <Input id="produto-nome" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>Descrição</Label>
            <Input value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="produto-codigo">Código</Label>
              <Input id="produto-codigo" value={form.codigo} onChange={e => setForm(f => ({ ...f, codigo: e.target.value }))} />
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
            <Select
              value={form.categoriaId ?? SEM_CATEGORIA}
              onValueChange={v => setForm(f => ({ ...f, categoriaId: v === SEM_CATEGORIA ? null : v ?? null }))}
            >
              <SelectTrigger className="w-full">
                {/* Base UI renderiza o próprio value (o id) por padrão — mapeamos para o nome. */}
                <SelectValue>
                  {v =>
                    v === SEM_CATEGORIA
                      ? 'Sem categoria'
                      // Enquanto as categorias carregam (ou se a do produto estiver inativa),
                      // cai no nome que já veio com o produto.
                      : categorias.find(c => c.id === v)?.nome ?? produto?.categoriaNome ?? 'Sem categoria'
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SEM_CATEGORIA}>Sem categoria</SelectItem>
                {categorias.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select
                value={form.tipo}
                onValueChange={v =>
                  setForm(f => ({
                    ...f,
                    tipo: (v as ProdutoTipo | null) ?? 'Fisico',
                    // Contratacao so faz sentido pra servico recorrente; um bem
                    // fisico volta ao valor neutro pra nao gravar restricao invisivel.
                    contratacaoPermitida: v === 'Servico' ? f.contratacaoPermitida : 'Ambas',
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {v => TIPOS.find(t => t.value === v)?.label ?? 'Físico (bem)'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {TIPOS.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="maxParcelas">Máx. parcelas</Label>
              <Input
                id="maxParcelas"
                type="number"
                min="0"
                max={MAX_PARCELAS_LIMITE}
                value={form.maxParcelas}
                onChange={e => {
                  const n = parseInt(e.target.value) || 0
                  setForm(f => ({ ...f, maxParcelas: Math.min(Math.max(n, 0), MAX_PARCELAS_LIMITE) }))
                }}
              />
              <p className="text-xs text-muted-foreground">0 ou 1 = somente à vista.</p>
            </div>
          </div>

          {form.tipo === 'Servico' && (
            <div className="space-y-1.5">
              <Label>Contratação permitida</Label>
              <Select
                value={form.contratacaoPermitida}
                onValueChange={v =>
                  setForm(f => ({ ...f, contratacaoPermitida: (v as ProdutoContratacaoPermitida | null) ?? 'Ambas' }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {v => CONTRATACOES.find(c => c.value === v)?.label ?? 'Mensal e anual'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {CONTRATACOES.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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
