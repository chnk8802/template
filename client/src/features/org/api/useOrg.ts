import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import type { Organization, UserOrg, CreateOrgInput } from '@/types/org.types';

// API functions
const orgApi = {
  getOrganizations: async () => {
    const response = await api.get<{ data: UserOrg[] }>('/orgs');
    return response.data.data;
  },

  getOrganization: async (orgSlug: string) => {
    const response = await api.get<{ data: Organization }>(`/orgs/${orgSlug}`);
    return response.data.data;
  },

  createOrganization: async (data: CreateOrgInput) => {
    const response = await api.post<{ data: { org: Organization; membership: any } }>('/orgs', data);
    return response.data.data;
  },
};

// Hooks
export const useOrganizations = () => {
  const { accessToken } = useAuthStore();
  
  return useQuery({
    queryKey: ['organizations'],
    queryFn: orgApi.getOrganizations,
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useOrganization = (orgSlug: string) => {
  return useQuery({
    queryKey: ['organization', orgSlug],
    queryFn: () => orgApi.getOrganization(orgSlug),
    enabled: !!orgSlug,
  });
};

export const useCreateOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: orgApi.createOrganization,
    onSuccess: () => {
      // Invalidate and refetch organizations after creating a new one
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
};
