import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Organization, UserOrg, CreateOrgInput } from '../types/org.types';
import { api } from '../lib/api';

interface OrgState {
  organizations: UserOrg[];
  currentOrg: Organization | null;
  isLoading: boolean;
}

interface OrgActions {
  fetchOrganizations: () => Promise<void>;
  setCurrentOrg: (org: Organization | null) => void;
  setLoading: (loading: boolean) => void;
  clearOrg: () => void;
  createOrganization: (data: CreateOrgInput) => Promise<UserOrg>;
}

type OrgStore = OrgState & OrgActions;

export const useOrgStore = create<OrgStore>()(
  persist(
    (set, get) => ({
      // Initial state
      organizations: [],
      currentOrg: null,
      isLoading: false,

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      clearOrg: () => {
        set({
          currentOrg: null,
        });
      },

      fetchOrganizations: async () => {
        set({ isLoading: true });
        try {
          const response = await api.get<{ data: UserOrg[] }>('/orgs');
          console.log("Fetched Orgs: ", response);
          const orgs = response.data.data;
          
          set({
            organizations: orgs,
            isLoading: false,
          });

          // Set current org if not set and orgs exist
          const currentOrg = get().currentOrg;
          if (!currentOrg && orgs.length > 0) {
            set({ currentOrg: orgs[0].org });
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      setCurrentOrg: (org: Organization | null) => {
        set({ currentOrg: org });
      },

      createOrganization: async (data: CreateOrgInput) => {
        set({ isLoading: true });
        try {
          const response = await api.post<{ data: UserOrg }>('/orgs', data);
          const newOrg = response.data.data;
          
          set((state) => ({
            organizations: [...state.organizations, newOrg],
            currentOrg: newOrg.org,
            isLoading: false,
          }));
          
          return newOrg;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
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
