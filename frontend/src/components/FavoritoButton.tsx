import { Heart } from 'lucide-react'
import { useFavoritos } from '@/context/FavoritosContext'
import { cn } from '@/lib/utils'

export function FavoritoButton({
  produtoId,
  size = 'sm',
  className,
}: {
  produtoId: string
  size?: 'sm' | 'md'
  className?: string
}) {
  const { isFavorito, toggle } = useFavoritos()
  const favoritado = isFavorito(produtoId)
  const iconClass = size === 'md' ? 'h-5 w-5' : 'h-4 w-4'

  return (
    <button
      type="button"
      aria-label={favoritado ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      onClick={e => {
        e.preventDefault()
        e.stopPropagation()
        toggle(produtoId)
      }}
      className={cn(
        'flex items-center justify-center rounded-full bg-white/90 p-1.5 text-zinc-700 shadow-sm transition-colors hover:bg-white',
        className
      )}
    >
      <Heart className={cn(iconClass, favoritado && 'fill-red-500 text-red-500')} />
    </button>
  )
}
