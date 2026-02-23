import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { 
  Test, 
  CreateTestInput, 
  UpdateTestInput,
  TestStatus,
} from '@/types/test.types';

// API functions
const testApi = {
  getTests: async (orgSlug: string, params?: {
    status?: TestStatus;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    const queryString = searchParams.toString();
    const response = await api.get<{ 
      data: Test[]; 
      meta: { total: number; page: number; totalPages: number } 
    }>(`/${orgSlug}/tests${queryString ? `?${queryString}` : ''}`);
    
    return {
      tests: response.data.data,
      ...response.data.meta,
    };
  },

  getTest: async (orgSlug: string, testId: string) => {
    const response = await api.get<{ data: Test }>(`/${orgSlug}/tests/${testId}`);
    return response.data.data;
  },

  createTest: async (orgSlug: string, data: CreateTestInput) => {
    const response = await api.post<{ data: Test }>(`/${orgSlug}/tests`, data);
    return response.data.data;
  },

  updateTest: async (orgSlug: string, testId: string, data: UpdateTestInput) => {
    const response = await api.put<{ data: Test }>(`/${orgSlug}/tests/${testId}`, data);
    return response.data.data;
  },

  deleteTest: async (orgSlug: string, testId: string) => {
    await api.delete(`/${orgSlug}/tests/${testId}`);
  },
};

// Hooks
export const useTests = (orgSlug: string, params?: {
  status?: TestStatus;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['tests', orgSlug, params],
    queryFn: () => testApi.getTests(orgSlug, params),
    enabled: !!orgSlug,
  });
};

export const useTest = (orgSlug: string, testId: string) => {
  return useQuery({
    queryKey: ['test', orgSlug, testId],
    queryFn: () => testApi.getTest(orgSlug, testId),
    enabled: !!orgSlug && !!testId,
  });
};

export const useCreateTest = (orgSlug: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTestInput) => testApi.createTest(orgSlug, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests', orgSlug] });
    },
  });
};

export const useUpdateTest = (orgSlug: string, testId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateTestInput) => testApi.updateTest(orgSlug, testId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests', orgSlug] });
      queryClient.invalidateQueries({ queryKey: ['test', orgSlug, testId] });
    },
  });
};

export const useDeleteTest = (orgSlug: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (testId: string) => testApi.deleteTest(orgSlug, testId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests', orgSlug] });
    },
  });
};
