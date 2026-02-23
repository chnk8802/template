import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, accessToken } = useAuthStore();
  const location = useLocation();

  // Not authenticated - redirect to login
  if (!isAuthenticated || !accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

interface AuthRouteProps {
  children: React.ReactNode;
}

/**
 * For routes that should only be accessible when NOT authenticated
 * (like login/register pages)
 */
export function AuthRoute({ children }: AuthRouteProps) {
  const { isAuthenticated, accessToken } = useAuthStore();

  // Already authenticated - redirect to dashboard
  if (isAuthenticated && accessToken) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
