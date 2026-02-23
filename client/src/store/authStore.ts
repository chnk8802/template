import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthState, LoginCredentials, RegisterData } from '../types/auth.types';
import { api, setAccessToken } from '../lib/api';

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  setAccessToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,

      // Actions
      setAccessToken: (token: string | null) => {
        set({ accessToken: token });
      },

      setUser: (user: User | null) => {
        set({ 
          user, 
          isAuthenticated: !!user 
        });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true });
        try {
          const response = await api.post<{ data: { user: User; accessToken: string } }>(
            '/auth/login',
            credentials
          );
          
          const { user, accessToken } = response.data.data;
          
          // Set access token in api module
          setAccessToken(accessToken);
          
          set({
            user,
            accessToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true });
        try {
          const response = await api.post<{ data: { user: User; accessToken: string } }>(
            '/auth/register',
            data
          );
          
          const { user, accessToken } = response.data.data;
          
          // Set access token in api module
          setAccessToken(accessToken);
          
          set({
            user,
            accessToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch {
          // Ignore logout errors
        } finally {
          // Clear access token in api module
          setAccessToken(null);
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
          });
        }
      },

      refreshAccessToken: async () => {
        try {
          const response = await api.post<{ data: { accessToken: string } }>(
            '/auth/refresh'
          );
          
          const { accessToken } = response.data.data;
          
          // Set access token in api module
          setAccessToken(accessToken);
          set({ accessToken });
        } catch (error) {
          // Refresh failed - clear auth state
          setAccessToken(null);
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      fetchCurrentUser: async () => {
        set({ isLoading: true });
        try {
          const response = await api.get<{ data: User }>('/auth/me');
          const user = response.data.data;
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,
          });
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
      }),
    }
  )
);