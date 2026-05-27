// src/hooks/useProducts.ts
// React Query hooks for fetching, creating, updating, and deleting products

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Product, ApiResponse } from '@/types';

// Fetch products with filters, sorting, search, and pagination
export function useProductsQuery(params: Record<string, any> = {}) {
  return useQuery<ApiResponse<{ products: Product[] }>>({
    queryKey: ['products', 'list', params],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<{ products: Product[] }>>('/products', { params });
      return data;
    },
  });
}

// Fetch featured products (top 12 featured items)
export function useFeaturedProductsQuery() {
  return useQuery<Product[]>({
    queryKey: ['products', 'featured'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<{ products: Product[] }>>('/products/featured');
      return data.data.products;
    },
  });
}

// Fetch product suggestions for autocomplete search
export function useProductSearchQuery(query: string, enabled = true) {
  return useQuery<Product[]>({
    queryKey: ['products', 'search', query],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<{ products: Product[] }>>('/products/search', {
        params: { q: query },
      });
      return data.data.products;
    },
    enabled: !!query && enabled,
  });
}

// Fetch single product detail by slug
export function useProductQuery(slug: string, enabled = true) {
  return useQuery<Product>({
    queryKey: ['products', 'detail', slug],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Product>>(`/products/${slug}`);
      return data.data;
    },
    enabled: !!slug && enabled,
  });
}

// Create a new product (Admin/Vendor)
export function useCreateProductMutation() {
  const queryClient = useQueryClient();
  return useMutation<Product, Error, Partial<Product>>({
    mutationFn: async (payload) => {
      const { data } = await api.post<ApiResponse<Product>>('/products', payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// Update an existing product (Admin/Vendor)
export function useUpdateProductMutation() {
  const queryClient = useQueryClient();
  return useMutation<Product, Error, { id: string; payload: Partial<Product> }>({
    mutationFn: async ({ id, payload }) => {
      const { data } = await api.put<ApiResponse<Product>>(`/products/${id}`, payload);
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', 'detail', data.slug] });
    },
  });
}

// Delete a product (Admin/Vendor)
export function useDeleteProductMutation() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await api.delete<ApiResponse<void>>(`/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// Add/upload product image (Admin/Vendor)
export function useAddProductImageMutation() {
  const queryClient = useQueryClient();
  return useMutation<Product, Error, { productId: string; file: File }>({
    mutationFn: async ({ productId, file }) => {
      const formData = new FormData();
      formData.append('image', file);
      const { data } = await api.post<ApiResponse<Product>>(`/products/${productId}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products', 'detail', data.slug] });
      queryClient.invalidateQueries({ queryKey: ['products', 'list'] });
    },
  });
}

// Delete product image (Admin/Vendor)
export function useDeleteProductImageMutation() {
  const queryClient = useQueryClient();
  return useMutation<Product, Error, { productId: string; imageId: string }>({
    mutationFn: async ({ productId, imageId }) => {
      const { data } = await api.delete<ApiResponse<Product>>(`/products/${productId}/images/${imageId}`);
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products', 'detail', data.slug] });
      queryClient.invalidateQueries({ queryKey: ['products', 'list'] });
    },
  });
}
