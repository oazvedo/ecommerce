import { Badge } from '@/components/ui/badge'
import type { PedidoStatus } from '@/types'

const config: Record<PedidoStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  Criado: { label: 'Criado', variant: 'secondary' },
  EmProcessamento: { label: 'Em Processamento', variant: 'default' },
  Suporte: { label: 'Suporte', variant: 'outline' },
  Finalizado: { label: 'Finalizado', variant: 'default' },
  Cancelado: { label: 'Cancelado', variant: 'destructive' },
}

export function OrderStatusBadge({ status }: { status: PedidoStatus }) {
  const { label, variant } = config[status] ?? { label: status, variant: 'secondary' }
  return <Badge variant={variant}>{label}</Badge>
}
