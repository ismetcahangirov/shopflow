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
