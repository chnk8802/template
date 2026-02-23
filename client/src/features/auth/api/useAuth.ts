import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/authStore';
import { api } from '../../../lib/api';
import type { LoginCredentials, RegisterData, User } from '../../../types/auth.types';

// API functions
const authApi = {
  login: async (credentials: LoginCredentials) => {
    const response = await api.post<{ data: { user: User; accessToken: string } }>(
      '/auth/login',
      credentials
    );
    return response.data.data;
  },

  register: async (data: RegisterData) => {
    const response = await api.post<{ data: { user: User; accessToken: string } }>(
      '/auth/register',
      data
    );
    return response.data.data;
  },

  logout: async () => {
    await api.post('/auth/logout');
  },

  getCurrentUser: async () => {
    const response = await api.get<{ data: User }>('/auth/me');
    return response.data.data;
  },
};

// Hooks
export const useLogin = () => {
  const { setUser, setAccessToken } = useAuthStore();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      setUser(data.user);
    },
  });
};

export const useRegister = () => {
  const { setUser, setAccessToken } = useAuthStore();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      setUser(data.user);
    },
  });
};

export const useLogout = () => {
  const { setUser, setAccessToken } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      // Clear state regardless of API success
      setAccessToken(null);
      setUser(null);
      queryClient.clear();
    },
  });
};

export const useCurrentUser = () => {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: authApi.getCurrentUser,
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
};
