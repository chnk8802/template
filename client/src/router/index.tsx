import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppRoute } from "@/components/auth/AppRoute";
import LoginPage from "@/features/auth/pages/LoginPage";
import RegisterPage from "@/features/auth/pages/RegisterPage";
import NoOrgPage from "@/pages/NoOrgPage";
import CreateOrgPage from "@/features/org/pages/CreateOrgPage";
import AcceptInvitationPage from "@/features/org/pages/AcceptInvitationPage";
import ProfileSettingsPage from "@/features/settings/pages/ProfileSettingsPage";
import TestListPage from "@/features/test/pages/TestListPage";

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
  // Guest-only routes (redirect if authenticated)
  {
    path: "/login",
    element: (
      <AppRoute guestOnly={true}>
        <LoginPage />
      </AppRoute>
    ),
  },
  {
    path: "/register",
    element: (
      <AppRoute guestOnly={true}>
        <RegisterPage />
      </AppRoute>
    ),
  },

  // Authenticated routes without org requirement
  {
    path: "/create-org",
    element: (
      <AppRoute requireAuth={true}>
        <CreateOrgPage />
      </AppRoute>
    ),
  },
  {
    path: "/no-org",
    element: (
      <AppRoute requireAuth={true}>
        <NoOrgPage />
      </AppRoute>
    ),
  },
  {
    path: "/accept-invitation",
    element: (
      <AppRoute requireAuth={true}>
        <AcceptInvitationPage />
      </AppRoute>
    ),
  },
  {
    path: "/settings/profile",
    element: (
      <AppRoute requireAuth={true}>
        <ProfileSettingsPage />
      </AppRoute>
    ),
  },

  // Authenticated routes with org requirement
  {
    path: "/dashboard",
    element: (
      <AppRoute requireAuth={true} requireOrg={true}>
        <DashboardPage />
      </AppRoute>
    ),
  },

  // Organization routes (with org slug in URL)
  {
    path: "/:orgSlug/dashboard",
    element: (
      <AppRoute requireAuth={true} requireOrg={true}>
        <OrgDashboardPage />
      </AppRoute>
    ),
  },
  {
    path: "/:orgSlug/tests",
    element: (
      <AppRoute requireAuth={true} requireOrg={true}>
        <TestListPage />
      </AppRoute>
    ),
  },

  // Redirects
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },

  // 404 - will be handled by a proper page later
  {
    path: "*",
    element: (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-bold">404 - Page Not Found</h1>
      </div>
    ),
  },
]);

export default router;
