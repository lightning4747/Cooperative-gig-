import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import type { UserRole } from '@/types/user'

interface ProtectedRouteProps {
  role: UserRole
}

export function ProtectedRoute({ role }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (user.role !== role) {
    const roleTarget =
      user.role === 'CUSTOMER'
        ? '/customer'
        : user.role === 'WORKER'
        ? '/worker'
        : '/federation'
    return <Navigate to={roleTarget} replace />
  }

  return <Outlet />
}
