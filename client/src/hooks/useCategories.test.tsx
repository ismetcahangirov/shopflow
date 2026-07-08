// src/hooks/useCategories.test.tsx
// Regression tests for useCategoriesQuery — it must always resolve to a Category[]
// array, unwrapping the API's { categories: [...] } envelope (Navbar crash fix).

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useCategoriesQuery } from './useCategories';

vi.mock('@/lib/api', () => ({ api: { get: vi.fn() } }));

function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  };
}

describe('useCategoriesQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('unwraps the { categories: [...] } envelope into an array', async () => {
    const cats = [{ id: '1', name: 'Elektronika', slug: 'elektronika' }];
    (api.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { success: true, data: { categories: cats } },
    });

    const { result } = renderHook(() => useCategoriesQuery(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(Array.isArray(result.current.data)).toBe(true);
    expect(result.current.data).toEqual(cats);
  });

  it('passes through a response that is already a bare array', async () => {
    const cats = [{ id: '2', name: 'Geyim', slug: 'geyim' }];
    (api.get as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { success: true, data: cats },
    });

    const { result } = renderHook(() => useCategoriesQuery(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(cats);
  });
});
