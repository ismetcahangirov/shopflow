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
  recentOrders: {
    id: string;
    orderNumber: string;
    total: number;
    status: string;
    createdAt: string;
    user: { name: string };
  }[];
}

/**
 * Admin dashboard metrics for the last `period` days.
 * `period` maps to the backend `?period` query param (number of days, 1–365).
 */
export function useDashboard(period = 30) {
  return useQuery<DashboardData>({
    queryKey: ['dashboard', period],
    queryFn: async () => {
      const res = await api.get<ApiResponse<DashboardData>>('/analytics/dashboard', {
        params: { period },
      });
      return res.data.data;
    },
  });
}

/**
 * A single point of the sales time-series returned by `GET /analytics/sales`.
 * Declared as a type alias (not an interface) so it satisfies the
 * `Record<string, unknown>` data prop of the chart components.
 */
export type SalesPoint = {
  period: string;
  revenue: number;
  orders: number;
};

export type SalesGroupBy = 'day' | 'month' | 'year';

export interface SalesChartParams {
  startDate?: string;
  endDate?: string;
  groupBy?: SalesGroupBy;
}

/**
 * Time-series sales data (ADMIN only) from `GET /analytics/sales`.
 * Supports a date range (`startDate`/`endDate`, ISO strings) and `groupBy`
 * granularity (day/month/year).
 */
export function useSalesChart({ startDate, endDate, groupBy = 'day' }: SalesChartParams = {}) {
  return useQuery<SalesPoint[]>({
    queryKey: ['sales-chart', startDate ?? null, endDate ?? null, groupBy],
    queryFn: async () => {
      const res = await api.get<ApiResponse<SalesPoint[]>>('/analytics/sales', {
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
