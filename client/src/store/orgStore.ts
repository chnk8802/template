import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Organization, Membership, UserOrg, Role } from '../types/org.types';
import { api } from '../lib/api';

interface OrgState {
  organizations: UserOrg[];
  currentOrg: Organization | null;
  currentMembership: Membership | null;
  isLoading: boolean;
}

interface OrgActions {
  fetchOrganizations: () => Promise<void>;
  setCurrentOrg: (org: Organization | null) => void;
  setCurrentMembership: (membership: Membership | null) => void;
  createOrganization: (data: { name: string; slug?: string; logo?: string }) => Promise<UserOrg>;
  updateOrganization: (orgSlug: string, data: Partial<Organization>) => Promise<Organization>;
  getOrganizationMembers: (orgSlug: string) => Promise<any[]>;
  inviteMember: (orgSlug: string, data: { email: string; role?: Role }) => Promise<{ invitation: any; inviteLink: string }>;
  acceptInvitation: (token: string) => Promise<{ membership: Membership; org: Organization }>;
  updateMemberRole: (orgSlug: string, memberId: string, role: Role) => Promise<Membership>;
  removeMember: (orgSlug: string, memberId: string) => Promise<void>;
  cancelInvitation: (orgSlug: string, invitationId: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  clearOrg: () => void;
}

type OrgStore = OrgState & OrgActions;

export const useOrgStore = create<OrgStore>()(
  persist(
    (set, get) => ({
      // Initial state
      organizations: [],
      currentOrg: null,
      currentMembership: null,
      isLoading: false,

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      clearOrg: () => {
        set({
          currentOrg: null,
          currentMembership: null,
        });
      },

      fetchOrganizations: async () => {
        set({ isLoading: true });
        try {
          const response = await api.get<{ data: UserOrg[] }>('/orgs');
          const orgs = response.data.data;
          
          set({
            organizations: orgs,
            isLoading: false,
          });

          // Set current org if not set and orgs exist
          const currentOrg = get().currentOrg;
          if (!currentOrg && orgs.length > 0) {
            set({
              currentOrg: orgs[0].org,
              currentMembership: orgs[0].membership,
            });
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      setCurrentOrg: (org: Organization | null) => {
        set({ currentOrg: org });
        
        // Update membership when org changes
        if (org) {
          const userOrg = get().organizations.find(o => o.org.id === org.id);
          if (userOrg) {
            set({ currentMembership: userOrg.membership });
          }
        } else {
          set({ currentMembership: null });
        }
      },

      setCurrentMembership: (membership: Membership | null) => {
        set({ currentMembership: membership });
      },

      createOrganization: async (data) => {
        set({ isLoading: true });
        try {
          const response = await api.post<{ data: UserOrg }>('/orgs', data);
          const newOrg = response.data.data;
          
          set(state => ({
            organizations: [...state.organizations, newOrg],
            currentOrg: newOrg.org,
            currentMembership: newOrg.membership,
            isLoading: false,
          }));

          return newOrg;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      updateOrganization: async (orgSlug, data) => {
        const response = await api.put<{ data: Organization }>(`/orgs/${orgSlug}`, data);
        const updatedOrg = response.data.data;

        set(state => ({
          organizations: state.organizations.map(o =>
            o.org.id === updatedOrg.id ? { ...o, org: updatedOrg } : o
          ),
          currentOrg: state.currentOrg?.id === updatedOrg.id ? updatedOrg : state.currentOrg,
        }));

        return updatedOrg;
      },

      getOrganizationMembers: async (orgSlug) => {
        const response = await api.get<{ data: any[] }>(`/orgs/${orgSlug}/members`);
        return response.data.data;
      },

      inviteMember: async (orgSlug, data) => {
        const response = await api.post<{ data: { invitation: any; inviteLink: string } }>(
          `/orgs/${orgSlug}/invitations`,
          data
        );
        return response.data.data;
      },

      acceptInvitation: async (token) => {
        const response = await api.post<{ data: { membership: Membership; org: Organization } }>(
          '/orgs/accept-invitation',
          { token }
        );
        const { membership, org } = response.data.data;

        // Add to organizations
        set(state => ({
          organizations: [...state.organizations, { org, membership }],
        }));

        return { membership, org };
      },

      updateMemberRole: async (orgSlug, memberId, role) => {
        const response = await api.put<{ data: Membership }>(
          `/orgs/${orgSlug}/members/${memberId}/role`,
          { role }
        );
        return response.data.data;
      },

      removeMember: async (orgSlug, memberId) => {
        await api.delete(`/orgs/${orgSlug}/members/${memberId}`);
      },

      cancelInvitation: async (orgSlug, invitationId) => {
        await api.delete(`/orgs/${orgSlug}/invitations/${invitationId}`);
      },
    }),
    {
      name: 'org-storage',
      partialize: (state) => ({
        currentOrg: state.currentOrg,
      }),
    }
  )
);
