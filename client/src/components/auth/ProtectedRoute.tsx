import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useOrgStore } from '@/store/orgStore';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOrg?: boolean; // Control whether organization is required
}

export function ProtectedRoute({ children, requireOrg = true }: ProtectedRouteProps) {
  const { isAuthenticated, accessToken } = useAuthStore();
  const { organizations, isLoading: orgLoading, fetchOrganizations } = useOrgStore();
  const location = useLocation();
  const [orgCheckComplete, setOrgCheckComplete] = useState(false);

  // Fetch organizations if authenticated but not loaded
  useEffect(() => {
    if (isAuthenticated && accessToken && organizations.length === 0 && !orgLoading) {
      fetchOrganizations()
        .then(() => setOrgCheckComplete(true))
        .catch(() => setOrgCheckComplete(true));
    } else if (organizations.length > 0 || !requireOrg) {
      setOrgCheckComplete(true);
    }
  }, [isAuthenticated, accessToken, organizations.length, orgLoading, requireOrg]);

  // Not authenticated - redirect to login
  if (!isAuthenticated || !accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Show loading while checking organizations
  if (requireOrg && !orgCheckComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Authenticated but no organization - redirect to create-org
  // Skip for routes that don't require org
  if (requireOrg && organizations.length === 0) {
    return <Navigate to="/create-org" state={{ from: location }} replace />;
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
  const { organizations } = useOrgStore();

  // Already authenticated
  if (isAuthenticated && accessToken) {
    // Has organization - go to dashboard
    if (organizations.length > 0) {
      return <Navigate to="/dashboard" replace />;
    }
    // No organization - go to create-org
    return <Navigate to="/create-org" replace />;
  }

  return <>{children}</>;
}
