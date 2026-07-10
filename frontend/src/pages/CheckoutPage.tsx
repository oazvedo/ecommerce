import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Navbar } from '@/components/Navbar'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { pedidosApi } from '@/api/pedidos'
import type { PedidoContratacao } from '@/types'
import { toast } from 'sonner'

export function CheckoutPage() {
  const { items, total, clear } = useCart()
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const [contratacao, setContratacao] = useState<PedidoContratacao>('Mensal')
  const [loading, setLoading] = useState(false)

  async function handleConfirm() {
    if (!usuario?.empresa_id) {
      toast.error('Empresa não encontrada no seu perfil.')
      return
    }
    if (items.length === 0) {
      toast.error('Carrinho vazio.')
      return
    }

    setLoading(true)
    try {
      const pedido = await pedidosApi.create({
        empresa_id: usuario.empresa_id,
        contratacao,
        itens: items.map(i => ({ produto_id: i.produto.id, quantidade: i.quantidade })),
      })
      clear()
      toast.success('Pedido criado com sucesso!')
      navigate(`/pedido/${pedido.id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao criar pedido')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-2xl px-4 py-16 text-center text-muted-foreground">
          <p className="text-lg">Seu carrinho está vazio.</p>
          <Button className="mt-4" onClick={() => navigate('/')}>
            Explorar Produtos
          </Button>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Voltar
        </Button>

        <h1 className="text-2xl font-bold mb-6">Finalizar Pedido</h1>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Itens do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map(({ produto, quantidade }) => (
                <div key={produto.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {produto.nome} × {quantidade}
                  </span>
                  <span className="font-medium">
                    {(produto.preco * quantidade).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span className="text-primary">
                  {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tipo de Contratação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <Label>Plano</Label>
                <Select
                  value={contratacao}
                  onValueChange={v => setContratacao(v as PedidoContratacao)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mensal">Mensal</SelectItem>
                    <SelectItem value="Anual">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {usuario && (
            <Card>
              <CardContent className="pt-4 text-sm text-muted-foreground">
                Pedido para: <span className="font-medium text-foreground">{usuario.nome}</span>
              </CardContent>
            </Card>
          )}

          <Button
            className="w-full h-12 text-base"
            onClick={handleConfirm}
            disabled={loading}
          >
            <CheckCircle2 className="mr-2 h-5 w-5" />
            {loading ? 'Processando...' : 'Confirmar Pedido'}
          </Button>
        </div>
      </main>
    </div>
  )
}
