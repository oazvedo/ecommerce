import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { MainLayout } from './MainLayout'
import type { Role } from '@/context/AuthContext'

export function ProtectedRoute({
  children,
  adminOnly = false,
  roles,
  requirePermission,
}: {
  children: React.ReactNode
  /** @deprecated use `roles={['admin']}` */
  adminOnly?: boolean
  /** Papéis autorizados. Se omitido, qualquer usuário autenticado passa. */
  roles?: Role[]
  /** Permissão granular exigida (checada no JWT). */
  requirePermission?: string
}) {
  const { isAuthenticated, isLoading, role, hasPermission } = useAuth()
  if (isLoading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />

  const allowedRoles = adminOnly ? ['admin' as Role] : roles
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/" replace />
  if (requirePermission && !hasPermission(requirePermission)) return <Navigate to="/" replace />

  return <MainLayout>{children}</MainLayout>
}
