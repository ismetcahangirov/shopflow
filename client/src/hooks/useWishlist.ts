// src/hooks/useWishlist.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { api } from '@/lib/api';
import type { ApiResponse } from '@/types';

export interface WishlistProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  isActive: boolean;
  image: string | null;
}

export interface WishlistItem {
  id: string;
  createdAt: string;
  product: WishlistProduct;
}

export function useWishlist(options?: { enabled?: boolean }) {
  return useQuery<WishlistItem[]>({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<WishlistItem[]>>('/wishlist');
      return res.data.data;
    },
    // Callers gate the query behind auth so an unauthenticated visit never
    // fires a doomed 401 request (issue #57).
    enabled: options?.enabled ?? true,
    // Don't retry client errors (401/403/404) — retrying a 401 only stretches
    // the skeleton for seconds before failing anyway.
    retry: (failureCount, error) => {
      const status = error instanceof AxiosError ? error.response?.status : undefined;
      if (status !== undefined && status >= 400 && status < 500) return false;
      return failureCount < 2;
    },
  });
}

export function useAddToWishlist() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (productId) => {
      await api.post('/wishlist', { productId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
}

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (productId) => {
      await api.delete(`/wishlist/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
}
