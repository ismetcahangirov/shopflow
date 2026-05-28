// src/hooks/useWishlist.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

export function useWishlist() {
  return useQuery<WishlistItem[]>({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<WishlistItem[]>>('/wishlist');
      return res.data.data;
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
