import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, PackageSearch, Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Navbar } from '@/components/Navbar'
import { ProductCard } from '@/components/ProductCard'
import { Pagination } from '@/components/Pagination'
import { StarRating } from '@/components/StarRating'
import { AvaliacoesSection } from '@/components/AvaliacoesSection'
import { produtosApi } from '@/api/produtos'
import { empresasApi } from '@/api/empresas'
import { avaliacoesApi } from '@/api/avaliacoes'
import { resolveImageUrl } from '@/api/upload'
import type { Loja, Produto, PagedResult, AvaliacaoResumo } from '@/types'

const EMPTY: Produto[] = []

function initials(nome: string): string {
  return nome.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

export function LojaPage() {
  const { id } = useParams<{ id: string }>()

  const [loja, setLoja] = useState<Loja | null>(null)
  const [resumo, setResumo] = useState<AvaliacaoResumo | null>(null)
  const [result, setResult] = useState<PagedResult<Produto> | null>(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { setPage(1) }, [id])

  useEffect(() => {
    if (!id) return
    empresasApi.getVitrine(id).then(setLoja).catch(() => setLoja(null))
    avaliacoesApi.resumoByEmpresa(id).then(setResumo).catch(() => setResumo(null))
  }, [id])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    produtosApi
      .list(page, 20, { empresaId: id })
      .then(setResult)
      .catch(err => setError(err instanceof Error ? err.message : 'Erro ao carregar produtos'))
      .finally(() => setLoading(false))
  }, [id, page])

  const items = result?.items ?? EMPTY
  const logo = loja?.empresa_logo_url ? resolveImageUrl(loja.empresa_logo_url) : null

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-6">
        <Button variant="ghost" size="sm" asChild className="mb-5">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao catálogo
          </Link>
        </Button>

        {/* Cabeçalho da loja */}
        <section className="mb-6 flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/10 text-primary">
            {logo ? (
              <img src={logo} alt={loja?.empresa_nome ?? 'Loja'} className="h-full w-full object-cover" />
            ) : loja ? (
              <span className="text-xl font-black">{initials(loja.empresa_nome)}</span>
            ) : (
              <Store className="h-7 w-7" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">Loja</p>
            <h1 className="mt-1 truncate text-2xl font-black tracking-tight">
              {loja?.empresa_nome ?? 'Carregando...'}
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {result?.totalCount ?? 0} produto{(result?.totalCount ?? 0) !== 1 ? 's' : ''}
            </p>
            {resumo && (
              <div className="mt-1.5">
                <StarRating nota={resumo.media} total={resumo.total} />
              </div>
            )}
          </div>
        </section>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-96 rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <EmptyState title="Não foi possível carregar" description={error} />
        ) : items.length === 0 ? (
          <EmptyState title="Nenhum produto nesta loja" description="Novos produtos em breve" />
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

        {id && (
          <div className="mt-6">
            <AvaliacoesSection alvo={{ empresaId: id }} />
          </div>
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
