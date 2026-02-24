import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useOrgStore } from '@/store/orgStore';

interface AppRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireOrg?: boolean;
  guestOnly?: boolean;
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );
}

export function AppRoute({ 
  children, 
  requireAuth = false, 
  requireOrg = false, 
  guestOnly = false 
}: AppRouteProps) {
  const location = useLocation();
  const { isAuthenticated, isLoading, accessToken, fetchCurrentUser } = useAuthStore();
  const { organizations, currentOrg, fetchOrganizations } = useOrgStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (accessToken && !isAuthenticated) {
        try {
          await fetchCurrentUser();
          await fetchOrganizations();
        } catch (error) {
          console.error('Auth check failed:', error);
        }
      }
      setIsChecking(false);
    };

    checkAuth();
  }, [accessToken, isAuthenticated, fetchCurrentUser, fetchOrganizations]);

  // Show loading state while checking auth
  if (isLoading || isChecking) {
    return <LoadingSpinner />;
  }

  // Guest-only routes (redirect if authenticated)
  if (guestOnly) {
    if (isAuthenticated) {
      // Redirect to appropriate page based on org status
      if (organizations.length > 0) {
        return <Navigate to="/dashboard" replace state={{ from: location }} />;
      } else {
        return <Navigate to="/no-org" replace state={{ from: location }} />;
      }
    }
    return <>{children}</>;
  }

  // Auth required routes
  if (requireAuth) {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace state={{ from: location }} />;
    }

    // Org required routes
    if (requireOrg) {
      if (!currentOrg || organizations.length === 0) {
        return <Navigate to="/no-org" replace state={{ from: location }} />;
      }
    }
  }

  return <>{children}</>;
}