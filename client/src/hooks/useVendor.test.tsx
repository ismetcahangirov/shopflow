// src/hooks/useVendor.test.tsx
// Exercises the vendor hooks directly (page tests mock this module, so without
// this the hook code is uncovered). Mocks the axios layer and asserts each hook
// hits the right endpoint / params and unwraps the response correctly.

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  useMyVendor,
  useVendorStats,
  useVendorApply,
  useVendorDashboard,
  useVendorOrders,
  useVendorSales,
  useUpdateMyVendor,
  useUploadVendorLogo,
  useUploadVendorBanner,
  useAdminVendors,
  useUpdateVendorStatus,
} from './useVendor';

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn() },
}));

const mockApi = api as unknown as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  put: ReturnType<typeof vi.fn>;
  patch: ReturnType<typeof vi.fn>;
};

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

const vendor = {
  id: 'v1', storeName: 'Acme', slug: 'acme', description: null, logo: null, banner: null,
  phone: null, address: null, status: 'APPROVED', commission: 10, totalSales: 0, productCount: 2,
};

describe('vendor queries', () => {
  it('useMyVendor unwraps GET /vendors/me', async () => {
    mockApi.get.mockResolvedValue({ data: { success: true, data: vendor } });
    const { result } = renderHook(() => useMyVendor(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockApi.get).toHaveBeenCalledWith('/vendors/me');
    expect(result.current.data).toEqual(vendor);
  });

  it('useVendorStats unwraps GET /vendors/me/stats', async () => {
    const stats = { totalProducts: 2, totalOrders: 4, totalRevenue: 100, pendingOrders: 1, avgRating: 4.5 };
    mockApi.get.mockResolvedValue({ data: { success: true, data: stats } });
    const { result } = renderHook(() => useVendorStats(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockApi.get).toHaveBeenCalledWith('/vendors/me/stats');
    expect(result.current.data).toEqual(stats);
  });

  it('useVendorDashboard defaults to period 30 and unwraps the envelope', async () => {
    const dash = { summary: {}, revenueChart: [], topProducts: [], lowStockProducts: [], recentOrders: [], ordersByStatus: {} };
    mockApi.get.mockResolvedValue({ data: { success: true, data: dash } });
    const { result } = renderHook(() => useVendorDashboard(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockApi.get).toHaveBeenCalledWith('/vendors/me/dashboard', { params: { period: 30 } });
    expect(result.current.data).toEqual(dash);
  });

  it('useVendorDashboard passes a custom period', async () => {
    mockApi.get.mockResolvedValue({ data: { success: true, data: {} } });
    const { result } = renderHook(() => useVendorDashboard(7), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockApi.get).toHaveBeenCalledWith('/vendors/me/dashboard', { params: { period: 7 } });
  });

  it('useVendorOrders sends page/limit/status and returns the full envelope', async () => {
    const envelope = { success: true, data: [{ id: 'o1' }], pagination: { total: 1, pages: 1, page: 2, limit: 5 } };
    mockApi.get.mockResolvedValue({ data: envelope });
    const { result } = renderHook(() => useVendorOrders({ page: 2, limit: 5, status: 'DELIVERED' }), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockApi.get).toHaveBeenCalledWith('/vendors/me/orders', { params: { page: 2, limit: 5, status: 'DELIVERED' } });
    expect(result.current.data).toEqual(envelope);
  });

  it('useVendorOrders defaults page/limit and omits an absent status', async () => {
    mockApi.get.mockResolvedValue({ data: { success: true, data: [], pagination: { total: 0, pages: 0, page: 1, limit: 10 } } });
    const { result } = renderHook(() => useVendorOrders(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockApi.get).toHaveBeenCalledWith('/vendors/me/orders', { params: { page: 1, limit: 10 } });
  });

  it('useVendorSales sends the range/granularity and defaults groupBy to day', async () => {
    const points = [{ period: '2026-06-01T00:00:00.000Z', revenue: 5, orders: 1 }];
    mockApi.get.mockResolvedValue({ data: { success: true, data: points } });
    const { result } = renderHook(
      () => useVendorSales({ startDate: '2026-06-01', endDate: '2026-06-30', groupBy: 'month' }),
      { wrapper: makeWrapper() },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockApi.get).toHaveBeenCalledWith('/vendors/me/analytics/sales', {
      params: { startDate: '2026-06-01', endDate: '2026-06-30', groupBy: 'month' },
    });
    expect(result.current.data).toEqual(points);

    mockApi.get.mockResolvedValue({ data: { success: true, data: [] } });
    const { result: r2 } = renderHook(() => useVendorSales(), { wrapper: makeWrapper() });
    await waitFor(() => expect(r2.current.isSuccess).toBe(true));
    expect(mockApi.get).toHaveBeenLastCalledWith('/vendors/me/analytics/sales', { params: { groupBy: 'day' } });
  });

  it('useAdminVendors omits the ALL status and forwards search/paging', async () => {
    mockApi.get.mockResolvedValue({ data: { success: true, data: [], pagination: { total: 0, pages: 0, page: 1, limit: 20 } } });
    const { result } = renderHook(() => useAdminVendors({ page: 1, status: 'ALL', search: 'x' }), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockApi.get).toHaveBeenCalledWith('/vendors', { params: { page: 1, search: 'x' } });

    mockApi.get.mockResolvedValue({ data: { success: true, data: [] } });
    const { result: r2 } = renderHook(() => useAdminVendors({ status: 'PENDING' }), { wrapper: makeWrapper() });
    await waitFor(() => expect(r2.current.isSuccess).toBe(true));
    expect(mockApi.get).toHaveBeenLastCalledWith('/vendors', { params: { status: 'PENDING' } });
  });
});

describe('vendor mutations', () => {
  it('useVendorApply POSTs to /vendors/apply', async () => {
    mockApi.post.mockResolvedValue({ data: { success: true, data: vendor } });
    const { result } = renderHook(() => useVendorApply(), { wrapper: makeWrapper() });
    result.current.mutate({ storeName: 'Acme', description: 'd', phone: '1' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockApi.post).toHaveBeenCalledWith('/vendors/apply', { storeName: 'Acme', description: 'd', phone: '1' });
    expect(result.current.data).toEqual(vendor);
  });

  it('useUpdateMyVendor PUTs to /vendors/me', async () => {
    mockApi.put.mockResolvedValue({ data: { success: true, data: vendor } });
    const { result } = renderHook(() => useUpdateMyVendor(), { wrapper: makeWrapper() });
    result.current.mutate({ storeName: 'New', phone: '999' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockApi.put).toHaveBeenCalledWith('/vendors/me', { storeName: 'New', phone: '999' });
  });

  it('useUploadVendorLogo POSTs multipart FormData to /vendors/me/logo', async () => {
    mockApi.post.mockResolvedValue({ data: { success: true, data: vendor } });
    const { result } = renderHook(() => useUploadVendorLogo(), { wrapper: makeWrapper() });
    const file = new File(['x'], 'logo.png', { type: 'image/png' });
    result.current.mutate(file);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const [url, body, cfg] = mockApi.post.mock.calls[0];
    expect(url).toBe('/vendors/me/logo');
    expect(body).toBeInstanceOf(FormData);
    expect((body as FormData).get('logo')).toBe(file);
    expect(cfg).toEqual({ headers: { 'Content-Type': 'multipart/form-data' } });
  });

  it('useUploadVendorBanner POSTs to /vendors/me/banner', async () => {
    mockApi.post.mockResolvedValue({ data: { success: true, data: vendor } });
    const { result } = renderHook(() => useUploadVendorBanner(), { wrapper: makeWrapper() });
    result.current.mutate(new File(['x'], 'b.png', { type: 'image/png' }));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockApi.post.mock.calls[0][0]).toBe('/vendors/me/banner');
    expect((mockApi.post.mock.calls[0][1] as FormData).get('banner')).toBeInstanceOf(File);
  });

  it('useUpdateVendorStatus PATCHes /vendors/:id/status', async () => {
    mockApi.patch.mockResolvedValue({ data: { success: true, data: { id: 'v1', status: 'APPROVED' } } });
    const { result } = renderHook(() => useUpdateVendorStatus(), { wrapper: makeWrapper() });
    result.current.mutate({ id: 'v1', status: 'APPROVED', note: 'ok' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockApi.patch).toHaveBeenCalledWith('/vendors/v1/status', { status: 'APPROVED', note: 'ok' });
  });
});
