// src/hooks/useCoupons.ts
// TanStack Query hooks for Admin coupon CRUD operations

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Coupon, ApiResponse } from '@/types';

interface CouponListResponse {
  coupons: Coupon[];
}

interface CreateCouponPayload {
  code: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
  minOrderValue?: number | null;
  maxDiscount?: number | null;
  maxUses?: number | null;
  isActive?: boolean;
  startsAt?: string | null;
  expiresAt?: string | null;
}

interface UpdateCouponPayload extends Partial<CreateCouponPayload> {
  id: string;
}

// Fetch coupon list (Admin)
export function useCouponsQuery(page = 1, limit = 20) {
  return useQuery<CouponListResponse>({
    queryKey: ['coupons', page, limit],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<CouponListResponse>>(
        `/coupons?page=${page}&limit=${limit}`
      );
      return data.data;
    },
  });
}

// Create new coupon (Admin)
export function useCreateCouponMutation() {
  const queryClient = useQueryClient();
  return useMutation<Coupon, Error, CreateCouponPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post<ApiResponse<Coupon>>('/coupons', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
  });
}

// Update existing coupon (Admin)
export function useUpdateCouponMutation() {
  const queryClient = useQueryClient();
  return useMutation<Coupon, Error, UpdateCouponPayload>({
    mutationFn: async ({ id, ...payload }) => {
      const { data } = await api.put<ApiResponse<Coupon>>(`/coupons/${id}`, payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
  });
}

// Delete coupon (Admin)
export function useDeleteCouponMutation() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await api.delete<ApiResponse<void>>(`/coupons/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
  });
}
