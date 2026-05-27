// src/hooks/useCategories.ts
// React Query hooks for fetching, creating, updating, and deleting categories

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Category, ApiResponse } from '@/types';

// Fetch category tree (all active categories hierarchically)
export function useCategoriesQuery() {
  return useQuery<Category[]>({
    queryKey: ['categories', 'tree'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Category[]>>('/categories');
      return data.data;
    },
  });
}

// Fetch single category detail by slug
export function useCategoryQuery(slug: string, enabled = true) {
  return useQuery<Category>({
    queryKey: ['categories', 'detail', slug],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Category>>(`/categories/${slug}`);
      return data.data;
    },
    enabled: !!slug && enabled,
  });
}

// Create new category (Admin)
export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation<Category, Error, Partial<Category>>({
    mutationFn: async (payload) => {
      const { data } = await api.post<ApiResponse<Category>>('/categories', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

// Update existing category (Admin)
export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation<Category, Error, { id: string; payload: Partial<Category> }>({
    mutationFn: async ({ id, payload }) => {
      const { data } = await api.put<ApiResponse<Category>>(`/categories/${id}`, payload);
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories', 'detail', data.slug] });
    },
  });
}

// Delete category (Admin)
export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await api.delete<ApiResponse<void>>(`/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

// Upload category image (Admin)
export function useUploadCategoryImageMutation() {
  return useMutation<string, Error, File>({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('image', file);
      
      const { data } = await api.post<ApiResponse<{ url: string }>>('/categories/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data.data.url;
    },
  });
}
