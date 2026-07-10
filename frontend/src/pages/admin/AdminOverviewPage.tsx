import { useEffect, useState } from 'react'
import { Building2, Users, Package, ShoppingBag } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { AdminLayout } from '@/layouts/AdminLayout'
import { empresasApi } from '@/api/empresas'
import { usuariosApi } from '@/api/usuarios'
import { produtosApi } from '@/api/produtos'
import { pedidosApi } from '@/api/pedidos'

interface StatCard {
  label: string
  value: number | null
  icon: React.ElementType
  color: string
}

export function AdminOverviewPage() {
  const [stats, setStats] = useState<StatCard[]>([
    { label: 'Empresas', value: null, icon: Building2, color: 'text-violet-500' },
    { label: 'Usuários', value: null, icon: Users, color: 'text-blue-500' },
    { label: 'Produtos', value: null, icon: Package, color: 'text-emerald-500' },
    { label: 'Pedidos', value: null, icon: ShoppingBag, color: 'text-amber-500' },
  ])

  useEffect(() => {
    Promise.allSettled([
      empresasApi.list(1, 1),
      usuariosApi.list(1, 1),
      produtosApi.list(1, 1),
      pedidosApi.list({ page: 1, pageSize: 1 }),
    ]).then(results => {
      setStats(prev =>
        prev.map((s, i) => ({
          ...s,
          value: results[i].status === 'fulfilled' ? results[i].value.totalCount : 0,
        }))
      )
    })
  }, [])

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Visão Geral</h1>
          <p className="text-sm text-muted-foreground mt-1">Resumo do sistema</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <Card key={label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                <Icon className={`h-5 w-5 ${color}`} />
              </CardHeader>
              <CardContent>
                {value === null ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-3xl font-bold">{value.toLocaleString('pt-BR')}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}
