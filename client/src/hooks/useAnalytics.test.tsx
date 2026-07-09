// src/hooks/useAnalytics.test.tsx
// Tests for the analytics hooks: useDashboard (period-aware) and useSalesChart
// (date range + granularity). Both must unwrap the { data } envelope and pass
// the right query params.

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useDashboard, useSalesChart } from './useAnalytics';

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn() },
}));

const mockApi = api as unknown as { get: ReturnType<typeof vi.fn> };

function makeWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useDashboard', () => {
  const dashboard = {
    summary: {
      totalRevenue: 100,
      totalOrders: 5,
      totalCustomers: 3,
      totalProducts: 10,
      avgOrderValue: 20,
    },
    revenueChart: [],
    topProducts: [],
    ordersByStatus: {},
    recentOrders: [],
  };

  it('defaults to a 30-day period and unwraps the data envelope', async () => {
    mockApi.get.mockResolvedValue({ data: { success: true, data: dashboard } });

    const { result } = renderHook(() => useDashboard(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApi.get).toHaveBeenCalledWith('/analytics/dashboard', { params: { period: 30 } });
    expect(result.current.data).toEqual(dashboard);
  });

  it('passes a custom period through to the query', async () => {
    mockApi.get.mockResolvedValue({ data: { success: true, data: dashboard } });

    const { result } = renderHook(() => useDashboard(7), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApi.get).toHaveBeenCalledWith('/analytics/dashboard', { params: { period: 7 } });
  });
});

describe('useSalesChart', () => {
  const points = [
    { period: '2026-06-01T00:00:00.000Z', revenue: 50, orders: 2 },
    { period: '2026-06-02T00:00:00.000Z', revenue: 70, orders: 3 },
  ];

  it('sends the date range and granularity and returns the series', async () => {
    mockApi.get.mockResolvedValue({ data: { success: true, data: points } });

    const { result } = renderHook(
      () => useSalesChart({ startDate: '2026-06-01', endDate: '2026-06-30', groupBy: 'month' }),
      { wrapper: makeWrapper() },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApi.get).toHaveBeenCalledWith('/analytics/sales', {
      params: { startDate: '2026-06-01', endDate: '2026-06-30', groupBy: 'month' },
    });
    expect(result.current.data).toEqual(points);
  });

  it('defaults groupBy to "day" and omits absent dates', async () => {
    mockApi.get.mockResolvedValue({ data: { success: true, data: points } });

    const { result } = renderHook(() => useSalesChart(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApi.get).toHaveBeenCalledWith('/analytics/sales', { params: { groupBy: 'day' } });
  });
});
