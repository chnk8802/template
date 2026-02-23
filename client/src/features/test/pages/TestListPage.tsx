import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTests, useCreateTest, useDeleteTest } from '../api/useTest';
import { useOrgStore } from '@/store/orgStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function TestListPage() {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const { currentMembership } = useOrgStore();
  
  const [search, setSearch] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTest, setNewTest] = useState({ title: '', description: '' });
  const [error, setError] = useState('');

  const { data, isLoading } = useTests(orgSlug!, { search });
  const createTestMutation = useCreateTest(orgSlug!);
  const deleteTestMutation = useDeleteTest(orgSlug!);

  const canCreate = currentMembership?.role === 'org_admin' || currentMembership?.role === 'manager';
  const canDelete = canCreate;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newTest.title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      await createTestMutation.mutateAsync(newTest);
      setNewTest({ title: '', description: '' });
      setShowCreateForm(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create test');
    }
  };

  const handleDelete = async (testId: string) => {
    if (!confirm('Are you sure you want to delete this test?')) return;
    
    try {
      await deleteTestMutation.mutateAsync(testId);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete test');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tests</h1>
        {canCreate && (
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? 'Cancel' : 'Create Test'}
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search tests..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Create New Test</h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <Input
                id="title"
                type="text"
                value={newTest.title}
                onChange={(e) => setNewTest(prev => ({ ...prev, title: e.target.value }))}
                className="mt-1"
                placeholder="Test title"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <Input
                id="description"
                type="text"
                value={newTest.description}
                onChange={(e) => setNewTest(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1"
                placeholder="Test description (optional)"
              />
            </div>

            <Button type="submit" disabled={createTestMutation.isPending}>
              {createTestMutation.isPending ? 'Creating...' : 'Create'}
            </Button>
          </form>
        </div>
      )}

      {/* Tests List */}
      <div className="space-y-4">
        {data?.tests.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No tests found. {canCreate && 'Create one to get started!'}
          </div>
        ) : (
          data?.tests.map((test) => (
            <div
              key={test.id}
              className="bg-white shadow rounded-lg p-6 flex justify-between items-start"
            >
              <div>
                <h3 className="font-semibold text-lg">{test.title}</h3>
                {test.description && (
                  <p className="text-gray-600 mt-1">{test.description}</p>
                )}
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span className={`px-2 py-1 rounded ${
                    test.status === 'active' ? 'bg-green-100 text-green-700' :
                    test.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                    test.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {test.status}
                  </span>
                  <span>Created {new Date(test.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {canDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(test.id)}
                  disabled={deleteTestMutation.isPending}
                  className="text-red-600 hover:text-red-700"
                >
                  Delete
                </Button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <span className="text-sm text-gray-600">
            Page {data.page} of {data.totalPages} ({data.total} total)
          </span>
        </div>
      )}

      {/* Back link */}
      <div className="mt-8">
        <Link to={`/${orgSlug}/dashboard`} className="text-indigo-600 hover:text-indigo-500">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
