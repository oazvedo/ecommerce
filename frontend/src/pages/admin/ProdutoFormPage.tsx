import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Navbar } from '@/components/Navbar'
import { produtosApi } from '@/api/produtos'
import type { ProdutoPayload } from '@/api/produtos'
import { toast } from 'sonner'

const EMPTY: ProdutoPayload = {
  nome: '',
  descricao: '',
  preco: 0,
  codigo: '',
  status: true,
}

export function ProdutoFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = !!id

  const [form, setForm] = useState<ProdutoPayload>(EMPTY)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    produtosApi
      .get(id)
      .then(p =>
        setForm({
          nome: p.nome,
          descricao: p.descricao,
          preco: p.preco,
          codigo: p.codigo,
          status: p.status,
        })
      )
      .catch(() => toast.error('Produto não encontrado.'))
      .finally(() => setLoading(false))
  }, [id])

  function set<K extends keyof ProdutoPayload>(key: K, value: ProdutoPayload[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nome.trim()) { toast.error('Nome é obrigatório.'); return }
    if (!form.codigo.trim()) { toast.error('Código é obrigatório.'); return }
    if (form.preco <= 0) { toast.error('Preço deve ser maior que zero.'); return }

    setSaving(true)
    try {
      if (isEdit && id) {
        await produtosApi.update(id, form)
        toast.success('Produto atualizado.')
      } else {
        await produtosApi.create(form)
        toast.success('Produto criado.')
      }
      navigate('/admin/produtos')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/admin/produtos')} className="mb-4">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Voltar
        </Button>

        <h1 className="text-2xl font-bold mb-6">
          {isEdit ? 'Editar Produto' : 'Novo Produto'}
        </h1>

        {loading ? (
          <Card>
            <CardContent className="pt-6 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Informações do Produto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1 sm:col-span-2">
                    <Label htmlFor="nome">Nome *</Label>
                    <Input
                      id="nome"
                      placeholder="Ex: Plano Empresarial Premium"
                      value={form.nome}
                      onChange={e => set('nome', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="codigo">Código *</Label>
                    <Input
                      id="codigo"
                      placeholder="Ex: PLAN-001"
                      value={form.codigo}
                      onChange={e => set('codigo', e.target.value.toUpperCase())}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="preco">Preço (R$) *</Label>
                    <Input
                      id="preco"
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="0,00"
                      value={form.preco === 0 ? '' : form.preco}
                      onChange={e => set('preco', parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Input
                      id="descricao"
                      placeholder="Descreva o produto..."
                      value={form.descricao}
                      onChange={e => set('descricao', e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label>Status</Label>
                    <Select
                      value={form.status ? 'true' : 'false'}
                      onValueChange={v => set('status', v === 'true')}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Ativo</SelectItem>
                        <SelectItem value="false">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/admin/produtos')}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white"
                disabled={saving}
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Criar Produto'}
              </Button>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}
