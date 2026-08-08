import { useEffect, useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BadgeCheck, PackageSearch, SlidersHorizontal, Sparkles, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Navbar } from '@/components/Navbar'
import { ProductCard } from '@/components/ProductCard'
import { Pagination } from '@/components/Pagination'
import { produtosApi, type ProdutoOrderBy } from '@/api/produtos'
import type { Produto, PagedResult } from '@/types'
import { cn } from '@/lib/utils'

type CatalogFilter = 'all' | 'available' | 'freeShipping'
type SortOption = ProdutoOrderBy | 'recentes'

const EMPTY_PRODUCTS: Produto[] = []

const FILTERS: { value: CatalogFilter; label: string; icon: ReactNode }[] = [
  { value: 'all', label: 'Todos', icon: <Sparkles className="h-3.5 w-3.5" /> },
  { value: 'available', label: 'Disponíveis', icon: <BadgeCheck className="h-3.5 w-3.5" /> },
  { value: 'freeShipping', label: 'Frete grátis', icon: <Truck className="h-3.5 w-3.5" /> },
]

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'recentes', label: 'Mais recentes' },
  { value: 'preco_asc', label: 'Menor preço' },
  { value: 'preco_desc', label: 'Maior preço' },
  { value: 'nome_asc', label: 'Nome (A-Z)' },
]

export function CatalogPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''

  const [result, setResult] = useState<PagedResult<Produto> | null>(null)
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState<CatalogFilter>('all')
  const [sort, setSort] = useState<SortOption>('recentes')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { setPage(1) }, [query, filter, sort])

  useEffect(() => {
    setLoading(true)
    setError(null)
    produtosApi
      .list(page, 20, {
        nome: query || undefined,
        disponivel: filter === 'available' ? true : undefined,
        freteGratis: filter === 'freeShipping' ? true : undefined,
        orderBy: sort === 'recentes' ? undefined : sort,
      })
      .then(setResult)
      .catch(err => setError(err instanceof Error ? err.message : 'Erro ao carregar produtos'))
      .finally(() => setLoading(false))
  }, [page, query, filter, sort])

  function cycleSort() {
    const currentIndex = SORT_OPTIONS.findIndex(o => o.value === sort)
    setSort(SORT_OPTIONS[(currentIndex + 1) % SORT_OPTIONS.length].value)
  }

  const filtered = result?.items ?? EMPTY_PRODUCTS
  const availableCount = filtered.filter(p => p.status).length
  const freeShippingCount = filtered.filter(p => p.freteGratis).length
  const featured = filtered[0]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_360px]">
          <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">Fluxus</p>
                <h1 className="mt-2 text-3xl font-black tracking-tight">Catálogo</h1>
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                  {query ? (
                    <>
                      <span className="font-semibold text-foreground">{result?.totalCount ?? 0}</span>
                      {' '}resultado{(result?.totalCount ?? 0) !== 1 ? 's' : ''} para{' '}
                      <span className="font-semibold text-primary">"{query}"</span>
                    </>
                  ) : (
                    <>
                      <span className="font-semibold text-foreground">{result?.totalCount ?? 0}</span>
                      {' '}produto{(result?.totalCount ?? 0) !== 1 ? 's' : ''}{' '}
                      {(result?.totalCount ?? 0) !== 1 ? 'disponíveis' : 'disponível'}
                    </>
                  )}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {FILTERS.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setFilter(option.value)}
                    className={cn(
                      'inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-semibold transition-colors',
                      filter === option.value
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground'
                    )}
                  >
                    {option.icon}
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <CatalogMetric label="Produtos" value={result?.totalCount ?? 0} />
              <CatalogMetric label="Disponíveis" value={availableCount} tone="emerald" />
              <CatalogMetric label="Frete grátis" value={freeShippingCount} tone="amber" />
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Destaque</p>
                <h2 className="mt-2 line-clamp-2 text-xl font-black">{featured?.nome ?? 'Nenhum produto'}</h2>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-5 rounded-lg border border-border bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">Preço</p>
              <p className="mt-1 text-2xl font-black text-primary">
                {(featured?.preco ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
              <p className="mt-3 truncate text-xs font-mono text-muted-foreground">{featured?.codigo ?? '--'}</p>
            </div>
          </section>
        </div>

        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold">Produtos</h2>
          <Button variant="outline" size="sm" className="gap-1.5 text-muted-foreground" onClick={cycleSort}>
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {SORT_OPTIONS.find(o => o.value === sort)?.label}
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-96 rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <EmptyState
            icon={<PackageSearch className="h-12 w-12" />}
            title="Não foi possível carregar"
            description={error}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<PackageSearch className="h-12 w-12" />}
            title={query ? `Nenhum resultado para "${query}"` : 'Nenhum produto disponível'}
            description={query ? 'Tente outro termo de busca' : 'Novos produtos em breve'}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {filtered.map(p => (
                <ProductCard key={p.id} produto={p} />
              ))}
            </div>
            {result && result.totalPages > 1 && (
              <Pagination page={page} totalPages={result.totalPages} onPageChange={setPage} />
            )}
          </>
        )}
      </main>
    </div>
  )
}

function CatalogMetric({
  label,
  value,
  tone = 'primary',
}: {
  label: string
  value: number
  tone?: 'primary' | 'emerald' | 'amber'
}) {
  const toneClass = {
    primary: 'bg-primary/10 text-primary',
    emerald: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    amber: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  }[tone]

  return (
    <div className="rounded-lg border border-border bg-background px-4 py-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={cn('mt-1 w-fit rounded-md px-2 py-0.5 text-xl font-black', toneClass)}>{value}</p>
    </div>
  )
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card py-24 text-muted-foreground">
      <div className="opacity-30">{icon}</div>
      <p className="font-semibold text-foreground">{title}</p>
      <p className="text-sm">{description}</p>
    </div>
  )
}
