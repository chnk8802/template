import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAcceptInvitation } from '../api/useOrg';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';

export default function AcceptInvitationPage() {
  const [searchParams] = useSearchParams();
  const acceptInvitationMutation = useAcceptInvitation();
  const { isAuthenticated } = useAuthStore();
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [orgSlug, setOrgSlug] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link. No token provided.');
    }
  }, [token]);

  const handleAccept = async () => {
    if (!token) return;

    setError('');
    try {
      const result = await acceptInvitationMutation.mutateAsync(token);
      setOrgSlug(result.org.slug);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to accept invitation');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center space-y-8">
          <div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Accept Invitation
            </h2>
            <p className="mt-4 text-gray-600">
              You need to be logged in to accept this invitation.
            </p>
          </div>

          <div className="space-y-4">
            <Link to={`/login?redirect=/accept-invitation?token=${token}`}>
              <Button className="w-full">
                Sign in to accept invitation
              </Button>
            </Link>

            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <Link
                to={`/register?redirect=/accept-invitation?token=${token}`}
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center space-y-8">
          <div>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Welcome!
            </h2>
            <p className="mt-4 text-gray-600">
              You have successfully joined the organization.
            </p>
          </div>

          <Link to={`/${orgSlug}/dashboard`}>
            <Button className="w-full">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-8">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Accept Invitation
          </h2>
          <p className="mt-4 text-gray-600">
            You've been invited to join an organization.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <Button
            onClick={handleAccept}
            className="w-full"
            disabled={!token || acceptInvitationMutation.isPending}
          >
            {acceptInvitationMutation.isPending ? 'Accepting...' : 'Accept Invitation'}
          </Button>

          <Link to="/dashboard">
            <Button variant="outline" className="w-full">
              Skip for now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
