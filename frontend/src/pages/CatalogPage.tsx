import { useEffect, useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BadgeCheck, PackageSearch, SlidersHorizontal, Sparkles, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ProductCard } from '@/components/ProductCard'
import { Pagination } from '@/components/Pagination'
import { produtosApi, type ProdutoOrderBy } from '@/api/produtos'
import { categoriasApi } from '@/api/categorias'
import type { Produto, PagedResult, CategoriaProduto } from '@/types'
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
  const [categoria, setCategoria] = useState<string>('all')
  const [categorias, setCategorias] = useState<CategoriaProduto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    categoriasApi.list(1, 200, true).then(r => setCategorias(r.items)).catch(() => {})
  }, [])

  useEffect(() => { setPage(1) }, [query, filter, sort, categoria])

  useEffect(() => {
    setLoading(true)
    setError(null)
    produtosApi
      .list(page, 20, {
        nome: query || undefined,
        disponivel: filter === 'available' ? true : undefined,
        freteGratis: filter === 'freeShipping' ? true : undefined,
        orderBy: sort === 'recentes' ? undefined : sort,
        categoriaId: categoria === 'all' ? undefined : categoria,
      })
      .then(setResult)
      .catch(err => setError(err instanceof Error ? err.message : 'Erro ao carregar produtos'))
      .finally(() => setLoading(false))
  }, [page, query, filter, sort, categoria])

  function cycleSort() {
    const currentIndex = SORT_OPTIONS.findIndex(o => o.value === sort)
    setSort(SORT_OPTIONS[(currentIndex + 1) % SORT_OPTIONS.length].value)
  }

  const filtered = result?.items ?? EMPTY_PRODUCTS

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-black tracking-tight">Catálogo</h1>
          <p className="mt-1 text-sm text-muted-foreground">
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

        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
            {FILTERS.map(option => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={cn(
                  'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-sm font-semibold transition-colors',
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

          <div className="flex items-center gap-2">
            {categorias.length > 0 && (
              <Select value={categoria} onValueChange={v => setCategoria(v ?? 'all')}>
                <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas categorias</SelectItem>
                  {categorias.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button variant="outline" size="sm" className="gap-1.5 text-muted-foreground" onClick={cycleSort}>
              <SlidersHorizontal className="h-3.5 w-3.5" />
              {SORT_OPTIONS.find(o => o.value === sort)?.label}
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
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
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
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
