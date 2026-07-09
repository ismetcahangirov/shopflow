// src/hooks/useSettings.test.tsx
// Tests for the settings hooks: useSettings (public read) and useUpdateSettings
// (ADMIN write) which posts a { settings: [{key,value}] } payload.

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useSettings, useUpdateSettings, SETTINGS_KEYS } from './useSettings';

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn(), put: vi.fn() },
}));

const mockApi = api as unknown as {
  get: ReturnType<typeof vi.fn>;
  put: ReturnType<typeof vi.fn>;
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

const settings = {
  site_name: 'ShopFlow',
  site_email: 'info@shopflow.az',
  currency: 'AZN',
  currency_symbol: '₼',
  shipping_cost: '5',
  free_shipping_min: '100',
  tax_rate: '18',
};

describe('SETTINGS_KEYS', () => {
  it('lists exactly the API-supported keys', () => {
    expect([...SETTINGS_KEYS]).toEqual([
      'site_name',
      'site_email',
      'currency',
      'currency_symbol',
      'shipping_cost',
      'free_shipping_min',
      'tax_rate',
    ]);
  });
});

describe('useSettings', () => {
  it('fetches settings and unwraps the data envelope', async () => {
    mockApi.get.mockResolvedValue({ data: { success: true, data: settings } });

    const { result } = renderHook(() => useSettings(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApi.get).toHaveBeenCalledWith('/settings');
    expect(result.current.data).toEqual(settings);
  });
});

describe('useUpdateSettings', () => {
  it('PUTs the settings array payload', async () => {
    mockApi.put.mockResolvedValue({ data: { success: true } });

    const { result } = renderHook(() => useUpdateSettings(), { wrapper: makeWrapper() });
    result.current.mutate([
      { key: 'site_name', value: 'New Name' },
      { key: 'tax_rate', value: '20' },
    ]);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApi.put).toHaveBeenCalledWith('/settings', {
      settings: [
        { key: 'site_name', value: 'New Name' },
        { key: 'tax_rate', value: '20' },
      ],
    });
  });
});
