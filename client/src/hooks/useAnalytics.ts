// src/hooks/useAnalytics.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ApiResponse } from '@/types';

export interface DashboardData {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
    avgOrderValue: number;
  };
  revenueChart: { date: string; revenue: number; orders: number }[];
  topProducts: { id: string; name: string; salesCount: number; revenue: number }[];
  ordersByStatus: Record<string, number>;
  recentOrders: { id: string; orderNumber: string; total: number; status: string; createdAt: string; user: { name: string } }[];
}

export function useDashboard() {
  return useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<DashboardData>>('/analytics/dashboard');
      return res.data.data;
    },
  });
}
