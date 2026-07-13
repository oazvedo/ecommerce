import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, ShoppingBag, TrendingUp, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'

const features = [
  { icon: ShoppingBag, text: 'Gerencie todos os seus pedidos' },
  { icon: TrendingUp, text: 'Acompanhe relatórios em tempo real' },
  { icon: Zap, text: 'Processamento rápido e seguro' },
]

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Credenciais inválidas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-gradient-to-br from-violet-600 via-purple-700 to-violet-900 p-12 text-white relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-white/10" />
        <div className="absolute -bottom-16 -right-16 h-80 w-80 rounded-full bg-white/5" />
        <div className="absolute top-1/2 left-1/4 h-32 w-32 rounded-full bg-white/5" />

        <div className="relative z-10 max-w-sm text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <Package className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">Fluxus</h1>
          <p className="mt-3 text-lg text-purple-100 leading-relaxed">
            Sua central de gerenciamento de pedidos e produtos
          </p>

          <div className="mt-10 space-y-3 text-left">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/20">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-sm text-purple-50">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2 md:hidden">
            <Package className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold">Fluxus</span>
          </div>

          <h2 className="text-2xl font-bold">Bem-vindo de volta</h2>
          <p className="mt-1 text-sm text-muted-foreground">Entre com suas credenciais para continuar</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <Button
              type="submit"
              className="h-11 w-full font-semibold text-sm"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Acesso restrito a usuários cadastrados
          </p>
        </div>
      </div>
    </div>
  )
}
