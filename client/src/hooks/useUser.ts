import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ApiResponse } from '@/types';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

export function useMe() {
  return useQuery<UserProfile>({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<UserProfile>>('/auth/me');
      return res.data.data;
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation<UserProfile, Error, { name?: string; email?: string }>({
    mutationFn: async (payload) => {
      const res = await api.put<ApiResponse<UserProfile>>('/users/me', payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

export function useUpdatePassword() {
  return useMutation<void, Error, { currentPassword: string; newPassword: string; confirmPassword: string }>({
    mutationFn: async (payload) => {
      await api.put('/users/me/password', payload);
    },
  });
}

export function useUpdateAvatar() {
  const queryClient = useQueryClient();

  return useMutation<{ avatar: string }, Error, File>({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await api.post<ApiResponse<{ avatar: string }>>('/users/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

export interface AdminUsersParams {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
  isActive?: boolean;
}

export interface AdminUser extends UserProfile {
  lastLoginAt?: string | null;
  _count?: {
    orders: number;
  };
}

export function useAdminUsers(params: AdminUsersParams) {
  return useQuery<ApiResponse<AdminUser[]>>({
    queryKey: ['admin-users', params],
    queryFn: async () => {
      const res = await api.get<ApiResponse<AdminUser[]>>('/users', { params });
      return res.data;
    },
  });
}

export function useToggleUserStatus() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<void>, Error, { id: string; isActive: boolean }>({
    mutationFn: async ({ id, isActive }) => {
      const res = await api.patch<ApiResponse<void>>(`/users/${id}/status`, { isActive });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
}

