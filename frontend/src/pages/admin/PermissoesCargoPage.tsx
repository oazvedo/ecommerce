import { useEffect, useState } from 'react'
import { AdminLayout } from '@/layouts/AdminLayout'
import { permissoesApi } from '@/api/permissoes'
import type { Permissao } from '@/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { ShieldAlert } from 'lucide-react'

const CARGOS = ['Operador', 'Gerente', 'Diretor', 'Administrador']

const GRUPOS: Record<string, string[]> = {
  Empresa: ['Empresa.Read', 'Empresa.Create', 'Empresa.Update', 'Empresa.Delete'],
  Usuário: ['Usuario.Read', 'Usuario.Create', 'Usuario.Update', 'Usuario.Delete', 'Usuario.EmailUpdate', 'Usuario.PasswordUpdate'],
  Permissão: ['Permissao.Read', 'Permissao.Assign', 'Permissao.Remove', 'Permissao.RemoveAll'],
  Produto: ['Produto.Read', 'Produto.Create', 'Produto.Update', 'Produto.Delete'],
  Pedido: ['Pedido.Read', 'Pedido.Create', 'Pedido.Update', 'Pedido.Delete', 'Pedido.UpdateAdmin'],
  Carteira: ['Carteira.Read', 'Carteira.Create', 'Carteira.Update', 'Carteira.Delete'],
}

export function PermissoesCargoPage() {
  const [allPermissoes, setAllPermissoes] = useState<Permissao[]>([])
  const [cargoMap, setCargoMap] = useState<Record<string, Set<string>>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    try {
      const [permResult, cargoResult] = await Promise.all([
        permissoesApi.list(1, 200),
        permissoesApi.byCargo(),
      ])
      setAllPermissoes(permResult.items)
      const map: Record<string, Set<string>> = {}
      for (const cargo of CARGOS) {
        const perms = cargoResult[cargo] ?? []
        map[cargo] = new Set(perms.map((p: Permissao) => p.id))
      }
      setCargoMap(map)
    } catch {
      toast.error('Erro ao carregar permissões')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function toggle(cargo: string, permId: string) {
    if (cargo === 'Administrador') return
    setCargoMap(prev => {
      const next = { ...prev, [cargo]: new Set(prev[cargo]) }
      if (next[cargo].has(permId)) next[cargo].delete(permId)
      else next[cargo].add(permId)
      return next
    })
  }

  async function handleSave(cargo: string) {
    if (cargo === 'Administrador') return
    setSaving(cargo)
    try {
      const ids = Array.from(cargoMap[cargo] ?? [])
      await permissoesApi.setCargo(cargo, ids)
      toast.success(`Permissões do cargo ${cargo} salvas.`)
    } catch {
      toast.error('Erro ao salvar permissões')
    } finally {
      setSaving(null)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Permissões por Cargo</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Defina quais operações cada cargo pode realizar.
          </p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 rounded" />)}
          </div>
        ) : (
          <Tabs defaultValue="Operador">
            <TabsList>
              {CARGOS.map(c => <TabsTrigger key={c} value={c}>{c}</TabsTrigger>)}
            </TabsList>

            {CARGOS.map(cargo => (
              <TabsContent key={cargo} value={cargo} className="mt-4 space-y-4">
                {cargo === 'Administrador' ? (
                  <Card>
                    <CardContent className="flex items-center gap-3 py-6">
                      <ShieldAlert className="h-5 w-5 text-primary shrink-0" />
                      <p className="text-sm text-muted-foreground">
                        O cargo <strong>Administrador</strong> sempre possui todas as permissões e não pode ser editado.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    {Object.entries(GRUPOS).map(([grupo, permNames]) => {
                      const perms = allPermissoes.filter(p => permNames.includes(p.nome))
                      if (perms.length === 0) return null
                      return (
                        <Card key={grupo}>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold">{grupo}</CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="flex flex-wrap gap-2">
                              {perms.map(perm => {
                                const active = cargoMap[cargo]?.has(perm.id) ?? false
                                return (
                                  <button
                                    key={perm.id}
                                    onClick={() => toggle(cargo, perm.id)}
                                    className="focus:outline-none"
                                    type="button"
                                  >
                                    <Badge
                                      variant={active ? 'default' : 'outline'}
                                      className="cursor-pointer select-none text-xs py-1 px-2.5 transition-colors"
                                    >
                                      {perm.nome.split('.')[1]}
                                    </Badge>
                                  </button>
                                )
                              })}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}

                    <Button
                      onClick={() => handleSave(cargo)}
                      disabled={saving === cargo}
                      className="w-full sm:w-auto"
                    >
                      {saving === cargo ? 'Salvando...' : `Salvar permissões de ${cargo}`}
                    </Button>
                  </>
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </AdminLayout>
  )
}
