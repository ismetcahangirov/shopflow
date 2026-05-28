// src/hooks/useAddresses.ts
// TanStack Query hooks for address CRUD operations

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ApiResponse, Address } from '@/types';

const ADDRESSES_KEY = ['addresses'] as const;

export function useAddresses() {
  return useQuery<Address[]>({
    queryKey: ADDRESSES_KEY,
    queryFn: async () => {
      const res = await api.get<ApiResponse<Address[]>>('/addresses');
      return res.data.data;
    },
  });
}

export function useAddress(id: string | undefined) {
  return useQuery<Address | undefined>({
    queryKey: [...ADDRESSES_KEY, 'detail', id],
    queryFn: async () => {
      if (!id) return undefined;
      const res = await api.get<ApiResponse<Address[]>>('/addresses');
      return res.data.data.find((a: Address) => a.id === id);
    },
    enabled: !!id,
  });
}

export interface CreateAddressPayload {
  fullName: string;
  phone: string;
  city: string;
  district: string;
  street: string;
  building?: string;
  apartment?: string;
  zip?: string;
  isDefault?: boolean;
}

export interface UpdateAddressPayload extends Partial<CreateAddressPayload> {
  id: string;
}

export function useCreateAddress() {
  const queryClient = useQueryClient();

  return useMutation<Address, Error, CreateAddressPayload>({
    mutationFn: async (payload) => {
      const res = await api.post<ApiResponse<Address>>('/addresses', payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESSES_KEY });
    },
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();

  return useMutation<Address, Error, UpdateAddressPayload>({
    mutationFn: async ({ id, ...payload }) => {
      const res = await api.put<ApiResponse<Address>>(`/addresses/${id}`, payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESSES_KEY });
    },
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await api.delete(`/addresses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESSES_KEY });
    },
  });
}

export function useSetDefaultAddress() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await api.patch(`/addresses/${id}/default`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESSES_KEY });
    },
  });
}
