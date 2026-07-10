import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PackageSearch, SlidersHorizontal } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Navbar } from '@/components/Navbar'
import { ProductCard } from '@/components/ProductCard'
import { Pagination } from '@/components/Pagination'
import { produtosApi } from '@/api/produtos'
import type { Produto, PagedResult } from '@/types'

export function CatalogPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''

  const [result, setResult] = useState<PagedResult<Produto> | null>(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { setPage(1) }, [query])

  useEffect(() => {
    setLoading(true)
    setError(null)
    produtosApi
      .list(page, 20)
      .then(setResult)
      .catch(err => setError(err instanceof Error ? err.message : 'Erro ao carregar produtos'))
      .finally(() => setLoading(false))
  }, [page])

  const items = result?.items ?? []
  const filtered = query
    ? items.filter(
        p =>
          p.nome.toLowerCase().includes(query.toLowerCase()) ||
          p.codigo.toLowerCase().includes(query.toLowerCase())
      )
    : items

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-5">
        {/* Context bar */}
        <div className="flex items-center justify-between mb-5 min-h-[28px]">
          {query ? (
            <p className="text-sm text-muted-foreground">
              <span className="text-foreground font-medium">{filtered.length}</span>
              {' '}resultado{filtered.length !== 1 ? 's' : ''} para{' '}
              <span className="text-primary font-medium">"{query}"</span>
            </p>
          ) : result ? (
            <p className="text-sm text-muted-foreground">
              <span className="text-foreground font-medium">{result.totalCount}</span> produtos disponíveis
            </p>
          ) : (
            <Skeleton className="h-4 w-32" />
          )}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Mais recentes</span>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 20 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
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
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {filtered.map(p => (
                <ProductCard key={p.id} produto={p} />
              ))}
            </div>
            {!query && result && result.totalPages > 1 && (
              <Pagination page={page} totalPages={result.totalPages} onPageChange={setPage} />
            )}
          </>
        )}
      </main>
    </div>
  )
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
      <div className="opacity-20">{icon}</div>
      <p className="font-medium text-foreground">{title}</p>
      <p className="text-sm">{description}</p>
    </div>
  )
}
