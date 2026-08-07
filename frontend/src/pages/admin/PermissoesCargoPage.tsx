import { useEffect, useState } from 'react'
import { AdminLayout } from '@/layouts/AdminLayout'
import { permissoesApi } from '@/api/permissoes'
import type { Permissao } from '@/types'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { ShieldCheck, User, UserCog, Briefcase, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

const CARGOS = ['Operador', 'Gerente', 'Diretor', 'Administrador'] as const
type Cargo = typeof CARGOS[number]

const CARGO_META: Record<Cargo, { icon: React.ElementType; color: string; bg: string; description: string }> = {
  Operador:      { icon: User,        color: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-500/10',    description: 'Acesso básico ao sistema' },
  Gerente:       { icon: UserCog,     color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-500/10', description: 'Gestão de operações' },
  Diretor:       { icon: Briefcase,   color: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-500/10',  description: 'Acesso ampliado' },
  Administrador: { icon: ShieldCheck, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10', description: 'Acesso total (imutável)' },
}

const GRUPOS: Record<string, string[]> = {
  Empresa:   ['Empresa.Read', 'Empresa.Create', 'Empresa.Update', 'Empresa.Delete'],
  Usuário:   ['Usuario.Read', 'Usuario.Create', 'Usuario.Update', 'Usuario.Delete', 'Usuario.EmailUpdate', 'Usuario.PasswordUpdate'],
  Permissão: ['Permissao.Read', 'Permissao.Assign', 'Permissao.Remove', 'Permissao.RemoveAll'],
  Produto:   ['Produto.Read', 'Produto.Create', 'Produto.Update', 'Produto.Delete'],
  Pedido:    ['Pedido.Read', 'Pedido.Create', 'Pedido.Update', 'Pedido.Delete', 'Pedido.UpdateAdmin'],
  Carteira:  ['Carteira.Read', 'Carteira.Create', 'Carteira.Update', 'Carteira.Delete'],
}

const ACAO_LABEL: Record<string, string> = {
  Read:           'Visualizar',
  Create:         'Criar',
  Update:         'Editar',
  Delete:         'Excluir',
  EmailUpdate:    'Alterar e-mail',
  PasswordUpdate: 'Alterar senha',
  Assign:         'Atribuir',
  Remove:         'Remover',
  RemoveAll:      'Remover todas',
  UpdateAdmin:    'Editar (admin)',
}

export function PermissoesCargoPage() {
  const [allPermissoes, setAllPermissoes] = useState<Permissao[]>([])
  const [cargoMap, setCargoMap] = useState<Record<string, Set<string>>>({})
  const [loading, setLoading] = useState(true)
  const [cargo, setCargo] = useState<Cargo>('Operador')
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const [permResult, cargoResult] = await Promise.all([
        permissoesApi.list(1, 200),
        permissoesApi.byCargo(),
      ])
      setAllPermissoes(permResult.items)
      const map: Record<string, Set<string>> = {}
      for (const c of CARGOS) {
        const perms = cargoResult[c] ?? []
        map[c] = new Set(perms.map((p: Permissao) => p.id))
      }
      setCargoMap(map)
    } catch {
      toast.error('Erro ao carregar permissões')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function toggle(permId: string) {
    if (cargo === 'Administrador') return
    setCargoMap(prev => {
      const next = { ...prev, [cargo]: new Set(prev[cargo]) }
      if (next[cargo].has(permId)) next[cargo].delete(permId)
      else next[cargo].add(permId)
      return next
    })
  }

  async function handleSave() {
    if (cargo === 'Administrador') return
    setSaving(true)
    try {
      const ids = Array.from(cargoMap[cargo] ?? [])
      await permissoesApi.setCargo(cargo, ids)
      toast.success(`Permissões do cargo ${cargo} salvas.`)
    } catch {
      toast.error('Erro ao salvar permissões')
    } finally {
      setSaving(false)
    }
  }

  const currentPerms = cargoMap[cargo] ?? new Set<string>()
  const isAdmin = cargo === 'Administrador'

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
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
            </div>
            <Skeleton className="h-96 rounded-xl" />
          </div>
        ) : (
          <>
            {/* Seletor de cargo */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {CARGOS.map(c => {
                const meta = CARGO_META[c]
                const Icon = meta.icon
                const active = cargo === c
                const count = cargoMap[c]?.size ?? 0
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCargo(c)}
                    className={cn(
                      'rounded-xl border p-4 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      active
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border bg-card hover:border-primary/40 hover:bg-muted/30'
                    )}
                  >
                    <div className={cn('mb-3 inline-flex rounded-lg p-2', meta.bg)}>
                      <Icon className={cn('h-4 w-4', meta.color)} />
                    </div>
                    <p className="text-sm font-semibold">{c}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{count} permissões</p>
                  </button>
                )
              })}
            </div>

            {/* Painel de permissões */}
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">

              {/* Header do painel */}
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div className="flex items-center gap-3">
                  {(() => {
                    const Icon = CARGO_META[cargo].icon
                    return (
                      <div className={cn('rounded-lg p-2 shrink-0', CARGO_META[cargo].bg)}>
                        <Icon className={cn('h-4 w-4', CARGO_META[cargo].color)} />
                      </div>
                    )
                  })()}
                  <div>
                    <p className="font-semibold text-sm">{cargo}</p>
                    <p className="text-xs text-muted-foreground">{CARGO_META[cargo].description}</p>
                  </div>
                </div>

                {isAdmin ? (
                  <Badge className="gap-1.5 border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 shrink-0">
                    <Lock className="h-3 w-3" />
                    Imutável
                  </Badge>
                ) : (
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="hidden text-xs text-muted-foreground sm:block">
                      {currentPerms.size} de {allPermissoes.length} ativas
                    </span>
                    <Button size="sm" onClick={handleSave} disabled={saving}>
                      {saving ? 'Salvando...' : 'Salvar'}
                    </Button>
                  </div>
                )}
              </div>

              {/* Corpo */}
              {isAdmin ? (
                <div className="flex items-center gap-3 px-5 py-10 text-muted-foreground">
                  <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
                  <p className="text-sm">
                    O cargo <strong className="text-foreground">Administrador</strong> possui todas as
                    permissões do sistema automaticamente e não pode ser editado.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {Object.entries(GRUPOS).map(([grupo, permNames]) => {
                    const perms = allPermissoes.filter(p => permNames.includes(p.nome))
                    if (perms.length === 0) return null
                    const activeCount = perms.filter(p => currentPerms.has(p.id)).length
                    return (
                      <div key={grupo} className="px-5 py-4">
                        <div className="mb-3 flex items-center justify-between">
                          <p className="text-sm font-semibold">{grupo}</p>
                          <span className={cn(
                            'text-xs font-medium tabular-nums',
                            activeCount === perms.length ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'
                          )}>
                            {activeCount}/{perms.length}
                          </span>
                        </div>
                        <div className="space-y-3">
                          {perms.map(perm => {
                            const acao = perm.nome.split('.')[1]
                            const active = currentPerms.has(perm.id)
                            return (
                              <div
                                key={perm.id}
                                className="flex items-center justify-between gap-4"
                                onClick={() => toggle(perm.id)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={e => e.key === 'Enter' && toggle(perm.id)}
                              >
                                <div className="min-w-0">
                                  <p className="text-sm font-medium">{ACAO_LABEL[acao] ?? acao}</p>
                                  <p className="text-xs text-muted-foreground font-mono truncate">{perm.nome}</p>
                                </div>
                                <Switch
                                  checked={active}
                                  onCheckedChange={() => toggle(perm.id)}
                                  className="shrink-0"
                                />
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}
