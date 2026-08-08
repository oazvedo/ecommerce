import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Store, Sparkles, Package, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Navbar } from '@/components/Navbar'
import { empresasApi } from '@/api/empresas'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'

const beneficios = [
  { icon: Store, text: 'Sua própria loja dentro do marketplace' },
  { icon: Package, text: 'Cadastre produtos e comece a vender na hora' },
  { icon: ShieldCheck, text: 'Sem espera por aprovação — ativa imediatamente' },
]

export function QueroVenderPage() {
  const { refreshSession, isLojista, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [nome, setNome] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [telefone, setTelefone] = useState('')
  const [loading, setLoading] = useState(false)

  const jaEhLojista = isLojista || isAdmin

  useEffect(() => {
    if (jaEhLojista) navigate('/minha-empresa', { replace: true })
  }, [jaEhLojista, navigate])

  if (jaEhLojista) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const empresa = await empresasApi.onboarding({ nome, cnpj, telefone })
      await refreshSession()
      toast.success('Loja criada! Bem-vindo(a) como lojista.')
      navigate(`/minha-empresa/${empresa.empresa_id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível criar sua loja')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="h-4 w-4" />
            <p className="text-xs font-semibold uppercase tracking-widest">Quero vender</p>
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Crie sua loja</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cadastre sua loja e comece a vender no marketplace agora mesmo, sem aprovação manual.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {beneficios.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-2 rounded-lg border border-border bg-background p-3">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="text-xs text-muted-foreground">{text}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="nome" className="text-sm font-medium">
                Nome da loja
              </Label>
              <Input
                id="nome"
                type="text"
                placeholder="Ex: Loja da Ana"
                value={nome}
                onChange={e => setNome(e.target.value)}
                required
                autoFocus
                className="h-11"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="cnpj" className="text-sm font-medium">
                  CNPJ
                </Label>
                <Input
                  id="cnpj"
                  type="text"
                  placeholder="00.000.000/0001-00"
                  value={cnpj}
                  onChange={e => setCnpj(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="telefone" className="text-sm font-medium">
                  Telefone
                </Label>
                <Input
                  id="telefone"
                  type="text"
                  placeholder="(11) 90000-0000"
                  value={telefone}
                  onChange={e => setTelefone(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
            </div>

            <Button type="submit" className="h-11 w-full font-semibold" disabled={loading}>
              {loading ? 'Criando loja...' : 'Criar minha loja'}
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}
