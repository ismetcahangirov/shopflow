// src/hooks/useOrders.ts
// TanStack Query hooks for order operations

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ApiResponse } from '@/types';

export interface OrderListItem {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  discount: number;
  itemCount: number;
  createdAt: string;
  user?: { id: string; name: string; email: string };
}

export interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  trackingNumber: string | null;
  subtotal: number;
  shippingCost: number;
  discount: number;
  tax: number;
  total: number;
  notes: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string };
  address: {
    fullName: string;
    phone: string;
    city: string;
    district: string;
    street: string;
    building: string | null;
    apartment: string | null;
  };
  items: OrderDetailItem[];
  coupon?: { code: string; value: number; type: string } | null;
  statusHistory: { status: string; note: string | null; createdAt: string }[];
}

export interface OrderDetailItem {
  id: string;
  productName: string;
  productSku: string;
  quantity: number;
  price: number;
  total: number;
  product?: {
    id: string;
    name: string;
    slug: string;
    image: string | null;
  } | null;
}

export interface CreateOrderPayload {
  addressId: string;
  couponCode?: string;
  notes?: string;
}

export interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
}

export function useOrders(params: {
  page?: number;
  limit?: number;
  status?: string;
  paymentStatus?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
} = {}) {
  return useQuery<ApiResponse<OrderListItem[]>>({
    queryKey: ['orders', params],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<OrderListItem[]>>('/orders', { params });
      return data;
    },
  });
}

export function useMyOrders(page = 1, limit = 10, status?: string) {
  return useQuery<OrderListItem[]>({
    queryKey: ['myOrders', page, limit, status],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(limit));
      if (status) params.set('status', status);
      const res = await api.get<ApiResponse<OrderListItem[]>>(`/orders/my?${params}`);
      return res.data.data;
    },
  });
}

export function useOrder(id: string) {
  return useQuery<OrderDetail>({
    queryKey: ['order', id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<OrderDetail>>(`/orders/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });
}

export function useCreateOrder() {
  return useMutation<OrderDetail, Error, CreateOrderPayload>({
    mutationFn: async (payload) => {
      const res = await api.post<ApiResponse<OrderDetail>>('/orders', payload);
      return res.data.data;
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; reason?: string }>({
    mutationFn: async ({ id, reason }) => {
      await api.post(`/orders/${id}/cancel`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myOrders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useCreatePaymentIntent() {
  return useMutation<CreatePaymentIntentResponse, Error, string>({
    mutationFn: async (orderId) => {
      const res = await api.post<ApiResponse<CreatePaymentIntentResponse>>('/payments/create-intent', { orderId });
      return res.data.data;
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation<OrderDetail, Error, { id: string; status: string; trackingNumber?: string; note?: string }>({
    mutationFn: async ({ id, status, trackingNumber, note }) => {
      const res = await api.patch<ApiResponse<OrderDetail>>(`/orders/${id}/status`, { status, trackingNumber, note });
      return res.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', data.id] });
    },
  });
}
