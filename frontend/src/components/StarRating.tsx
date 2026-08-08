import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export function StarRating({
  nota,
  total,
  size = 'sm',
}: {
  nota: number
  total?: number
  size?: 'sm' | 'md'
}) {
  const starClass = size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5'
  const arredondada = Math.round(nota)

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              starClass,
              i < arredondada ? 'fill-amber-400 text-amber-400' : 'fill-none text-muted-foreground/30'
            )}
          />
        ))}
      </div>
      {total !== undefined && (
        <span className="text-xs text-muted-foreground">
          {total > 0 ? `${nota.toFixed(1)} (${total})` : 'Sem avaliações'}
        </span>
      )}
    </div>
  )
}
