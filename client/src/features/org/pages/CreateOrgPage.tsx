import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCreateOrganization } from '../api/useOrg';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function CreateOrgPage() {
  const navigate = useNavigate();
  const createOrgMutation = useCreateOrganization();
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
  });
  const [error, setError] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Auto-generate slug from name if not manually edited
    if (name === 'name' && !slugManuallyEdited) {
      const generatedSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 50);
      setFormData((prev) => ({ ...prev, slug: generatedSlug }));
    }
    
    if (name === 'slug') {
      setSlugManuallyEdited(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.slug.length < 3) {
      setError('Slug must be at least 3 characters');
      return;
    }

    try {
      const result = await createOrgMutation.mutateAsync({
        name: formData.name,
        slug: formData.slug,
      });
      navigate(`/${result.org.slug}/dashboard`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create organization');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create Organization
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Set up your organization to get started
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Organization Name
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1"
                placeholder="My Organization"
              />
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                Organization Slug
              </label>
              <Input
                id="slug"
                name="slug"
                type="text"
                required
                value={formData.slug}
                onChange={handleChange}
                className="mt-1"
                placeholder="my-organization"
              />
              <p className="mt-1 text-xs text-gray-500">
                Used in your organization URL: /{formData.slug || 'my-org'}/...
              </p>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={createOrgMutation.isPending}
          >
            {createOrgMutation.isPending ? 'Creating...' : 'Create Organization'}
          </Button>

          <div className="text-center">
            <Link
              to="/dashboard"
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              Skip for now
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
