import { useCallback, useEffect, useState } from 'react'
import { Star, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { avaliacoesApi } from '@/api/avaliacoes'
import type { Avaliacao } from '@/types'

type AvaliacaoAlvo = { produtoId: string } | { empresaId: string }

export function AvaliacoesSection({ alvo }: { alvo: AvaliacaoAlvo }) {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([])
  const [loading, setLoading] = useState(true)
  const [nota, setNota] = useState(5)
  const [comentario, setComentario] = useState('')
  const [enviando, setEnviando] = useState(false)

  const carregar = useCallback(() => {
    setLoading(true)
    const fetcher = 'produtoId' in alvo
      ? avaliacoesApi.listByProduto(alvo.produtoId)
      : avaliacoesApi.listByEmpresa(alvo.empresaId)
    fetcher
      .then(r => setAvaliacoes(r.items))
      .catch(() => setAvaliacoes([]))
      .finally(() => setLoading(false))
  }, [alvo])

  useEffect(() => { carregar() }, [carregar])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setEnviando(true)
    try {
      await avaliacoesApi.avaliar({
        ...('produtoId' in alvo ? { produtoId: alvo.produtoId } : { empresaId: alvo.empresaId }),
        nota,
        comentario: comentario.trim() || undefined,
      })
      toast.success('Avaliação enviada!')
      setComentario('')
      carregar()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao enviar avaliação')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <MessageSquare className="h-4 w-4 text-primary" />
        Avaliações
      </h2>

      <form onSubmit={handleSubmit} className="mt-4 rounded-lg border border-border bg-background p-4">
        <p className="text-sm font-semibold">Deixe sua avaliação</p>
        <div className="mt-2 flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => {
            const valor = i + 1
            return (
              <button
                key={valor}
                type="button"
                aria-label={`${valor} estrela${valor > 1 ? 's' : ''}`}
                onClick={() => setNota(valor)}
                className="p-0.5"
              >
                <Star
                  className={cn(
                    'h-6 w-6 transition-colors',
                    valor <= nota ? 'fill-amber-400 text-amber-400' : 'fill-none text-muted-foreground/30'
                  )}
                />
              </button>
            )
          })}
        </div>
        <textarea
          value={comentario}
          onChange={e => setComentario(e.target.value)}
          placeholder="Conte sua experiência (opcional)"
          maxLength={1000}
          rows={3}
          className="mt-3 w-full resize-none rounded-lg border border-border bg-card p-2.5 text-sm outline-none focus:border-primary"
        />
        <Button type="submit" size="sm" className="mt-3" disabled={enviando}>
          {enviando ? 'Enviando...' : 'Enviar avaliação'}
        </Button>
      </form>

      <div className="mt-4 space-y-3">
        {loading ? (
          <p className="text-sm text-muted-foreground">Carregando avaliações...</p>
        ) : avaliacoes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Ainda não há avaliações. Seja o primeiro a avaliar.</p>
        ) : (
          avaliacoes.map(a => (
            <div key={a.id} className="rounded-lg border border-border bg-background p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-semibold">{a.usuarioNome}</span>
                  <span className="text-xs text-muted-foreground">
                    {a.criadoEm ? new Date(a.criadoEm).toLocaleDateString() : '—'}
                  </span>
                </div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn('h-3.5 w-3.5', i < a.nota ? 'fill-amber-400 text-amber-400' : 'fill-none text-muted-foreground/30')}
                    />
                  ))}
                </div>
              </div>
              {a.comentario && <p className="mt-1.5 text-sm text-muted-foreground">{a.comentario}</p>}
            </div>
          ))
        )}
      </div>
    </section>
  )
}
