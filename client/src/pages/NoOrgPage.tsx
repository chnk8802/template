import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function NoOrgPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-8">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            No Organization Found
          </h2>
          <p className="mt-4 text-gray-600">
            You're not a member of any organization yet. Create one to get started,
            or ask your administrator for an invitation link.
          </p>
        </div>

        <div className="space-y-4">
          <Link to="/create-org">
            <Button className="w-full">
              Create Organization
            </Button>
          </Link>

          <p className="text-sm text-gray-500">
            Already have an invitation link?{' '}
            <Link
              to="/accept-invitation"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Accept invitation
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
