import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';

export default function AcceptInvitationPage() {
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  
  const [error, setError] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link. No token provided.');
    }
  }, [token]);

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-8">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Accept Invitation
          </h2>
          <p className="mt-4 text-gray-600">
            Invitation acceptance is currently disabled. Please contact your administrator for assistance.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <Link to="/dashboard">
            <Button className="w-full">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
