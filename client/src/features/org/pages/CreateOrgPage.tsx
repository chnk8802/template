import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateOrganization } from '@/features/org/api/useOrg';
import { useOrgStore } from '@/store/orgStore';

export default function CreateOrgPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [logo, setLogo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const createOrgMutation = useCreateOrganization();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await createOrgMutation.mutateAsync({
        name: name.trim(),
        slug: slug.trim() || undefined,
        logo: logo.trim() || undefined,
      });
      
      // Navigate to the dashboard or home page after successful creation
      navigate('/');
    } catch (error) {
      console.error('Failed to create organization:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/no-org');
  };

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    setName(value);
    if (!slug) {
      setSlug(
        value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .slice(0, 50)
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Create Organization
          </h2>
          <p className="mt-4 text-gray-600">
            Enter the details for your new organization.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                autoComplete="organization"
                placeholder="Acme Corporation"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                disabled={isSubmitting}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Organization Slug</Label>
              <Input
                id="slug"
                name="slug"
                type="text"
                autoComplete="organization-slug"
                placeholder="acme-corporation"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                disabled={isSubmitting}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Used in URLs (e.g., acme-corporation.example.com)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo">Logo URL (Optional)</Label>
              <Input
                id="logo"
                name="logo"
                type="url"
                autoComplete="organization-logo"
                placeholder="https://example.com/logo.png"
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                disabled={isSubmitting}
                className="w-full"
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="flex-1"
            >
              {isSubmitting ? 'Creating...' : 'Create Organization'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
