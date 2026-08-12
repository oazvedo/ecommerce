import { useState, type FormEvent } from 'react'
import { KeyRound } from 'lucide-react'
import { ImageUpload } from '@/components/ImageUpload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAuth } from '@/context/AuthContext'
import { usuariosApi } from '@/api/usuarios'
import { toast } from 'sonner'

export function ContaPage() {
  const { usuario, refreshUsuario } = useAuth()

  const [nome, setNome] = useState(usuario?.nome ?? '')
  const [email, setEmail] = useState(usuario?.email ?? '')
  const [savingPerfil, setSavingPerfil] = useState(false)

  const [pwDialogOpen, setPwDialogOpen] = useState(false)
  const [novaSenha, setNovaSenha] = useState('')
  const [savingSenha, setSavingSenha] = useState(false)

  if (!usuario) {
    return (
      <div className="min-h-screen bg-background">
        <main className="mx-auto max-w-2xl px-4 py-16 text-center text-muted-foreground">
          Carregando...
        </main>
      </div>
    )
  }

  async function handleSalvarPerfil(e: FormEvent) {
    e.preventDefault()
    if (!usuario) return
    setSavingPerfil(true)
    try {
      if (nome !== usuario.nome) {
        await usuariosApi.update(usuario.id, { nome, email: usuario.email })
      }
      if (email !== usuario.email) {
        await usuariosApi.updateEmail(usuario.id, email)
      }
      await refreshUsuario()
      toast.success('Dados atualizados.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar dados')
    } finally {
      setSavingPerfil(false)
    }
  }

  async function handleAlterarSenha() {
    if (!usuario || !novaSenha) return
    setSavingSenha(true)
    try {
      await usuariosApi.updatePassword(usuario.id, novaSenha)
      toast.success('Senha alterada.')
      setPwDialogOpen(false)
      setNovaSenha('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao alterar senha')
    } finally {
      setSavingSenha(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-2xl space-y-6 px-4 py-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Conta</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight">Minha Conta</h1>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Foto de perfil</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <ImageUpload
              entidade="usuario"
              id={usuario.id}
              currentUrl={usuario.foto_url}
              variant="avatar"
              onSuccess={() => refreshUsuario()}
            />
            <div>
              <p className="text-sm font-semibold">{usuario.nome}</p>
              <div className="mt-1 flex items-center gap-1.5">
                <Badge variant="outline">{usuario.cargo}</Badge>
                <Badge variant={usuario.status === 'Ativo' ? 'default' : 'secondary'}>{usuario.status}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Dados pessoais</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSalvarPerfil} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Nome</Label>
                <Input value={nome} onChange={e => setNome(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>E-mail</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <Button type="submit" disabled={savingPerfil}>
                {savingPerfil ? 'Salvando...' : 'Salvar alterações'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Segurança</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" onClick={() => setPwDialogOpen(true)}>
              <KeyRound className="mr-2 h-4 w-4" />
              Alterar senha
            </Button>
          </CardContent>
        </Card>
      </main>

      <Dialog open={pwDialogOpen} onOpenChange={setPwDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar senha</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label>Nova senha</Label>
              <Input
                type="password"
                value={novaSenha}
                onChange={e => setNovaSenha(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <Button className="w-full" onClick={handleAlterarSenha} disabled={savingSenha || !novaSenha}>
              {savingSenha ? 'Salvando...' : 'Confirmar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
