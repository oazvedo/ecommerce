import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { empresasApi } from '@/api/empresas'
import type { Empresa, Usuario, PagedResult } from '@/types'
import { Navbar } from '@/components/Navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Building2, Phone, Hash, Users } from 'lucide-react'
import { toast } from 'sonner'

export function MinhaEmpresaPage() {
  const { empresaId } = useAuth()
  const [empresa, setEmpresa] = useState<Empresa | null>(null)
  const [usuarios, setUsuarios] = useState<PagedResult<Usuario> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!empresaId) return
    setLoading(true)
    Promise.all([
      empresasApi.get(empresaId),
      empresasApi.getUsuarios(empresaId, 1, 50),
    ])
      .then(([emp, usrs]) => {
        setEmpresa(emp)
        setUsuarios(usrs)
      })
      .catch(() => toast.error('Erro ao carregar dados da empresa'))
      .finally(() => setLoading(false))
  }, [empresaId])

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold">Minha Empresa</h1>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        ) : !empresa ? (
          <p className="text-muted-foreground">Empresa não encontrada.</p>
        ) : (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{empresa.empresa_nome}</CardTitle>
                      <p className="text-sm text-muted-foreground">{empresa.empresa_tipo}</p>
                    </div>
                  </div>
                  <Badge variant={empresa.empresa_status ? 'default' : 'secondary'}>
                    {empresa.empresa_status ? 'Ativo' : 'Inativo'}
                  </Badge>
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
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">Responsável:</span>
                  <span>{empresa.empresa_responsavel}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Colegas ({usuarios?.totalCount ?? 0})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {usuarios?.items.length === 0 ? (
                  <p className="px-6 py-4 text-sm text-muted-foreground">Nenhum colega encontrado.</p>
                ) : (
                  <div className="divide-y divide-border">
                    {usuarios?.items.map(u => (
                      <div key={u.id} className="flex items-center justify-between px-6 py-3">
                        <div>
                          <p className="text-sm font-medium">{u.nome}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
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
          </>
        )}
      </main>
    </div>
  )
}
