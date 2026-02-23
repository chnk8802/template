import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// API functions
const settingsApi = {
  getProfile: async () => {
    const response = await api.get<{ data: any }>('/settings/profile');
    return response.data.data;
  },

  updateProfile: async (data: { firstName?: string; lastName?: string }) => {
    const response = await api.put<{ data: any }>('/settings/profile', data);
    return response.data.data;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const response = await api.post('/settings/change-password', data);
    return response.data;
  },

  getOrganizations: async () => {
    const response = await api.get<{ data: any[] }>('/settings/organizations');
    return response.data.data;
  },

  getOrgSettings: async (orgSlug: string) => {
    const response = await api.get<{ data: any }>(`/settings/org/${orgSlug}`);
    return response.data.data;
  },

  updateOrgSettings: async (orgSlug: string, data: {
    allowMemberInvites?: boolean;
    defaultRole?: string;
  }) => {
    const response = await api.put<{ data: any }>(`/settings/org/${orgSlug}`, data);
    return response.data.data;
  },
};

// Hooks
export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: settingsApi.getProfile,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settingsApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: settingsApi.changePassword,
  });
};

export const useSettingsOrganizations = () => {
  return useQuery({
    queryKey: ['settings', 'organizations'],
    queryFn: settingsApi.getOrganizations,
  });
};

export const useOrgSettings = (orgSlug: string) => {
  return useQuery({
    queryKey: ['settings', 'org', orgSlug],
    queryFn: () => settingsApi.getOrgSettings(orgSlug),
    enabled: !!orgSlug,
  });
};

export const useUpdateOrgSettings = (orgSlug: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { allowMemberInvites?: boolean; defaultRole?: string }) =>
      settingsApi.updateOrgSettings(orgSlug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'org', orgSlug] });
      queryClient.invalidateQueries({ queryKey: ['organization', orgSlug] });
    },
  });
};
