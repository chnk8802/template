import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useOrgStore } from '@/store/orgStore';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import type { 
  Organization, 
  Membership, 
  UserOrg, 
  Role,
  CreateOrgInput,
  UpdateOrgInput,
  InviteMemberInput,
} from '@/types/org.types';

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
    const response = await api.post<{ data: UserOrg }>('/orgs', data);
    return response.data.data;
  },

  updateOrganization: async (orgSlug: string, data: UpdateOrgInput) => {
    const response = await api.put<{ data: Organization }>(`/orgs/${orgSlug}`, data);
    return response.data.data;
  },

  getMembers: async (orgSlug: string) => {
    const response = await api.get<{ data: any[] }>(`/orgs/${orgSlug}/members`);
    return response.data.data;
  },

  inviteMember: async (orgSlug: string, data: InviteMemberInput) => {
    const response = await api.post<{ data: { invitation: any; inviteLink: string } }>(
      `/orgs/${orgSlug}/invitations`,
      data
    );
    return response.data.data;
  },

  getInvitations: async (orgSlug: string) => {
    const response = await api.get<{ data: any[] }>(`/orgs/${orgSlug}/invitations`);
    return response.data.data;
  },

  acceptInvitation: async (token: string) => {
    const response = await api.post<{ data: { membership: Membership; org: Organization } }>(
      '/orgs/accept-invitation',
      { token }
    );
    return response.data.data;
  },

  updateMemberRole: async (orgSlug: string, memberId: string, role: Role) => {
    const response = await api.put<{ data: Membership }>(
      `/orgs/${orgSlug}/members/${memberId}/role`,
      { role }
    );
    return response.data.data;
  },

  removeMember: async (orgSlug: string, memberId: string) => {
    await api.delete(`/orgs/${orgSlug}/members/${memberId}`);
  },

  cancelInvitation: async (orgSlug: string, invitationId: string) => {
    await api.delete(`/orgs/${orgSlug}/invitations/${invitationId}`);
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
  const { setCurrentOrg, setCurrentMembership } = useOrgStore();

  return useMutation({
    mutationFn: orgApi.createOrganization,
    onSuccess: (data) => {
      setCurrentOrg(data.org);
      setCurrentMembership(data.membership);
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
};

export const useUpdateOrganization = (orgSlug: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateOrgInput) => orgApi.updateOrganization(orgSlug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization', orgSlug] });
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
};

export const useOrganizationMembers = (orgSlug: string) => {
  return useQuery({
    queryKey: ['members', orgSlug],
    queryFn: () => orgApi.getMembers(orgSlug),
    enabled: !!orgSlug,
  });
};

export const useInviteMember = (orgSlug: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InviteMemberInput) => orgApi.inviteMember(orgSlug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations', orgSlug] });
    },
  });
};

export const useOrganizationInvitations = (orgSlug: string) => {
  return useQuery({
    queryKey: ['invitations', orgSlug],
    queryFn: () => orgApi.getInvitations(orgSlug),
    enabled: !!orgSlug,
  });
};

export const useAcceptInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: orgApi.acceptInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
};

export const useUpdateMemberRole = (orgSlug: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: Role }) =>
      orgApi.updateMemberRole(orgSlug, memberId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', orgSlug] });
    },
  });
};

export const useRemoveMember = (orgSlug: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) => orgApi.removeMember(orgSlug, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', orgSlug] });
    },
  });
};

export const useCancelInvitation = (orgSlug: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) => orgApi.cancelInvitation(orgSlug, invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations', orgSlug] });
    },
  });
};
