import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ApiResponse } from '@/types';
import type { SalesPoint, SalesChartParams } from '@/hooks/useAnalytics';

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

// ─── Vendor dashboard (rich, scoped) ──────────────────────────────────────────

export interface VendorDashboardData {
  summary: {
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    avgRating: number;
    avgOrderValue: number;
  };
  revenueChart: { date: string; revenue: number; orders: number }[];
  topProducts: { id: string; name: string; salesCount: number; revenue: number }[];
  lowStockProducts: { id: string; name: string; stock: number; lowStockAlert: number }[];
  recentOrders: {
    id: string;
    orderNumber: string;
    vendorSubtotal: number;
    status: string;
    createdAt: string;
    user: { name: string };
  }[];
  ordersByStatus: Record<string, number>;
}

/** Vendor-scoped dashboard metrics for the last `period` days (1–365). */
export function useVendorDashboard(period = 30) {
  return useQuery<VendorDashboardData>({
    queryKey: ['vendor', 'dashboard', period],
    queryFn: async () => {
      const res = await api.get<ApiResponse<VendorDashboardData>>('/vendors/me/dashboard', {
        params: { period },
      });
      return res.data.data;
    },
  });
}

// ─── Vendor orders (scoped) ───────────────────────────────────────────────────

export interface VendorOrderListItem {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  user?: { id: string; name: string; email: string };
  vendorSubtotal: number;
  vendorItemCount: number;
}

export interface VendorOrdersParams {
  page?: number;
  limit?: number;
  status?: string;
}

/** Orders that contain the vendor's products; `vendorSubtotal` is the vendor's share only. */
export function useVendorOrders({ page = 1, limit = 10, status }: VendorOrdersParams = {}) {
  return useQuery<ApiResponse<VendorOrderListItem[]>>({
    queryKey: ['vendor', 'orders', page, limit, status ?? null],
    queryFn: async () => {
      const res = await api.get<ApiResponse<VendorOrderListItem[]>>('/vendors/me/orders', {
        params: { page, limit, ...(status ? { status } : {}) },
      });
      return res.data;
    },
  });
}

// ─── Vendor sales time-series (scoped) ────────────────────────────────────────

/** Vendor-scoped sales time-series from `GET /vendors/me/analytics/sales`. */
export function useVendorSales({ startDate, endDate, groupBy = 'day' }: SalesChartParams = {}) {
  return useQuery<SalesPoint[]>({
    queryKey: ['vendor', 'sales', startDate ?? null, endDate ?? null, groupBy],
    queryFn: async () => {
      const res = await api.get<ApiResponse<SalesPoint[]>>('/vendors/me/analytics/sales', {
        params: {
          ...(startDate ? { startDate } : {}),
          ...(endDate ? { endDate } : {}),
          groupBy,
        },
      });
      return res.data.data;
    },
  });
}

// ─── Store settings mutations ─────────────────────────────────────────────────

export interface UpdateMyVendorPayload {
  storeName?: string;
  description?: string;
  phone?: string;
  address?: string;
}

/** Update the caller's own store profile via `PUT /vendors/me`. */
export function useUpdateMyVendor() {
  const queryClient = useQueryClient();
  return useMutation<VendorProfile, Error, UpdateMyVendorPayload>({
    mutationFn: async (payload) => {
      const res = await api.put<ApiResponse<VendorProfile>>('/vendors/me', payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor'] });
    },
  });
}

function useUploadVendorImage(kind: 'logo' | 'banner') {
  const queryClient = useQueryClient();
  return useMutation<VendorProfile, Error, File>({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append(kind, file);
      const res = await api.post<ApiResponse<VendorProfile>>(`/vendors/me/${kind}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor'] });
    },
  });
}

/** Upload a new store logo via `POST /vendors/me/logo`. */
export function useUploadVendorLogo() {
  return useUploadVendorImage('logo');
}

/** Upload a new store banner via `POST /vendors/me/banner`. */
export function useUploadVendorBanner() {
  return useUploadVendorImage('banner');
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
