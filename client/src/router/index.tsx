import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute, AuthRoute } from '@/components/auth/ProtectedRoute';
import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage';
import NoOrgPage from '@/pages/NoOrgPage';
import CreateOrgPage from '@/features/org/pages/CreateOrgPage';
import AcceptInvitationPage from '@/features/org/pages/AcceptInvitationPage';
import ProfileSettingsPage from '@/features/settings/pages/ProfileSettingsPage';
import TestListPage from '@/features/test/pages/TestListPage';

// Placeholder for dashboard - will be created later
const DashboardPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-gray-600 mt-2">Select an organization to continue</p>
    </div>
  </div>
);

// Placeholder for org dashboard
const OrgDashboardPage = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-2xl font-bold">Organization Dashboard</h1>
      <p className="text-gray-600 mt-2">Welcome to your organization!</p>
    </div>
  </div>
);

export const router = createBrowserRouter([
  // Auth routes (only accessible when not authenticated)
  {
    path: '/login',
    element: (
      <AuthRoute>
        <LoginPage />
      </AuthRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <AuthRoute>
        <RegisterPage />
      </AuthRoute>
    ),
  },

  // Protected routes
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/no-org',
    element: (
      <ProtectedRoute>
        <NoOrgPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/create-org',
    element: (
      <ProtectedRoute>
        <CreateOrgPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/accept-invitation',
    element: (
      <ProtectedRoute>
        <AcceptInvitationPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/settings/profile',
    element: (
      <ProtectedRoute>
        <ProfileSettingsPage />
      </ProtectedRoute>
    ),
  },

  // Organization routes (with org slug in URL)
  {
    path: '/:orgSlug/dashboard',
    element: (
      <ProtectedRoute>
        <OrgDashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/:orgSlug/tests',
    element: (
      <ProtectedRoute>
        <TestListPage />
      </ProtectedRoute>
    ),
  },

  // Redirects
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },

  // 404 - will be handled by a proper page later
  {
    path: '*',
    element: (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-bold">404 - Page Not Found</h1>
      </div>
    ),
  },
]);

export default router;
