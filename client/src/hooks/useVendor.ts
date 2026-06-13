import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ApiResponse } from '@/types';

export interface VendorProfile {
  id: string;
  storeName: string;
  slug: string;
  description: string | null;
  logo: string | null;
  banner: string | null;
  phone: string | null;
  address: string | null;
  status: string;
  commission: number;
  totalSales: number;
  productCount: number;
}

export interface VendorStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  avgRating: number;
}

export function useMyVendor() {
  return useQuery<VendorProfile>({
    queryKey: ['vendor', 'me'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<VendorProfile>>('/vendors/me');
      return res.data.data;
    },
  });
}

export function useVendorApply() {
  const queryClient = useQueryClient();

  return useMutation<VendorProfile, Error, { storeName: string; description?: string; phone?: string }>({
    mutationFn: async (payload) => {
      const res = await api.post<ApiResponse<VendorProfile>>('/vendors/apply', payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor'] });
    },
  });
}

export function useVendorStats() {
  return useQuery<VendorStats>({
    queryKey: ['vendor', 'stats'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<VendorStats>>('/vendors/me/stats');
      return res.data.data;
    },
  });
}

// ─── Admin-only vendor types & hooks ──────────────────────────────────────────

export type VendorStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export interface AdminVendor {
  id: string;
  storeName: string;
  slug: string;
  description: string | null;
  logo: string | null;
  status: VendorStatus;
  commission: number;
  totalSales: number;
  productCount: number;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface AdminVendorsParams {
  page?: number;
  limit?: number;
  status?: VendorStatus | 'ALL';
  search?: string;
}

export function useAdminVendors(params: AdminVendorsParams) {
  const { status, ...rest } = params;
  const queryParams = {
    ...rest,
    ...(status && status !== 'ALL' ? { status } : {}),
  };

  return useQuery<ApiResponse<AdminVendor[]>>({
    queryKey: ['admin-vendors', params],
    queryFn: async () => {
      const res = await api.get<ApiResponse<AdminVendor[]>>('/vendors', { params: queryParams });
      return res.data;
    },
  });
}

export interface UpdateVendorStatusPayload {
  id: string;
  status: VendorStatus;
  note?: string;
}

export function useUpdateVendorStatus() {
  const queryClient = useQueryClient();

  return useMutation<{ id: string; status: VendorStatus }, Error, UpdateVendorStatusPayload>({
    mutationFn: async ({ id, status, note }) => {
      const res = await api.patch<ApiResponse<{ id: string; status: VendorStatus }>>(
        `/vendors/${id}/status`,
        { status, note },
      );
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vendors'] });
    },
  });
}
