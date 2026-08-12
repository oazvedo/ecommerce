import { useEffect, useState } from 'react'
import { Heart, PackageSearch } from 'lucide-react'
import { ProductCard } from '@/components/ProductCard'
import { Pagination } from '@/components/Pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { favoritosApi } from '@/api/favoritos'
import { useFavoritos } from '@/context/FavoritosContext'
import type { PagedResult, Produto } from '@/types'

const EMPTY: Produto[] = []

export function FavoritosPage() {
  const { favoritoIds } = useFavoritos()
  const [result, setResult] = useState<PagedResult<Produto> | null>(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    favoritosApi
      .list(page, 20)
      .then(setResult)
      .catch(err => setError(err instanceof Error ? err.message : 'Erro ao carregar favoritos'))
      .finally(() => setLoading(false))
    // Recarrega quando o conjunto de favoritos muda (ex: removeu um item por aqui mesmo).
  }, [page, favoritoIds])

  const items = result?.items ?? EMPTY

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Heart className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Meus favoritos</h1>
            <p className="text-sm text-muted-foreground">
              {result?.totalCount ?? 0} produto{(result?.totalCount ?? 0) !== 1 ? 's' : ''} favoritado{(result?.totalCount ?? 0) !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-96 rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <EmptyState title="Não foi possível carregar" description={error} />
        ) : items.length === 0 ? (
          <EmptyState title="Nenhum favorito ainda" description="Toque no coração de um produto para adicioná-lo aqui." />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {items.map(p => (
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

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card py-24 text-muted-foreground">
      <PackageSearch className="h-12 w-12 opacity-30" />
      <p className="font-semibold text-foreground">{title}</p>
      <p className="text-sm">{description}</p>
    </div>
  )
}
