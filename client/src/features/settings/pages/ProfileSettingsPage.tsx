import { useState } from 'react';
import { useProfile, useUpdateProfile, useChangePassword } from '../api/useSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ProfileSettingsPage() {
  const { data: profile, isLoading } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();

  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Initialize form when profile loads
  useState(() => {
    if (profile) {
      setProfileForm({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
      });
    }
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');

    try {
      await updateProfileMutation.mutateAsync(profileForm);
    } catch (err: any) {
      setProfileError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordSuccess('Password changed successfully');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
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
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-8">Account Settings</h1>

      {/* Profile Section */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Profile Information</h2>

        {profileError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-4">
            {profileError}
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First name
              </label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                value={profileForm.firstName}
                onChange={handleProfileChange}
                className="mt-1"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Last name
              </label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                value={profileForm.lastName}
                onChange={handleProfileChange}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <Input
              type="email"
              value={profile?.email || ''}
              disabled
              className="mt-1 bg-gray-50"
            />
            <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
          </div>

          <Button type="submit" disabled={updateProfileMutation.isPending}>
            {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </div>

      {/* Password Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Change Password</h2>

        {passwordError && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-4">
            {passwordError}
          </div>
        )}

        {passwordSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm mb-4">
            {passwordSuccess}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
              Current password
            </label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              required
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              className="mt-1"
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
              New password
            </label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              required
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              className="mt-1"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm new password
            </label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              className="mt-1"
            />
          </div>

          <Button type="submit" disabled={changePasswordMutation.isPending}>
            {changePasswordMutation.isPending ? 'Changing...' : 'Change Password'}
          </Button>
        </form>
      </div>
    </div>
  );
}
