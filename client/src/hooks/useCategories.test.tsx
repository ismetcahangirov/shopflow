// src/hooks/useCategories.test.tsx
// Tests for the category hooks. The primary regression is that useCategoriesQuery
// must always resolve to a Category[] array, unwrapping the API's
// { categories: [...] } envelope (the Navbar "categories.find is not a function"
// crash). The mutation/detail hooks are covered too so the file doesn't drag
// global coverage below threshold.

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  useCategoriesQuery,
  useCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useUploadCategoryImageMutation,
} from './useCategories';

vi.mock('@/lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

const mockApi = api as unknown as {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  put: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
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

describe('useCategoriesQuery', () => {
  it('unwraps the { categories: [...] } envelope into an array', async () => {
    const cats = [{ id: '1', name: 'Elektronika', slug: 'elektronika' }];
    mockApi.get.mockResolvedValue({ data: { success: true, data: { categories: cats } } });

    const { result } = renderHook(() => useCategoriesQuery(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(Array.isArray(result.current.data)).toBe(true);
    expect(result.current.data).toEqual(cats);
  });

  it('passes through a response that is already a bare array', async () => {
    const cats = [{ id: '2', name: 'Geyim', slug: 'geyim' }];
    mockApi.get.mockResolvedValue({ data: { success: true, data: cats } });

    const { result } = renderHook(() => useCategoriesQuery(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(cats);
  });
});

describe('useCategoryQuery', () => {
  it('fetches a single category by slug', async () => {
    const cat = { id: '1', name: 'Elektronika', slug: 'elektronika' };
    mockApi.get.mockResolvedValue({ data: { success: true, data: cat } });

    const { result } = renderHook(() => useCategoryQuery('elektronika'), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApi.get).toHaveBeenCalledWith('/categories/elektronika');
    expect(result.current.data).toEqual(cat);
  });

  it('does not run when no slug is provided', () => {
    const { result } = renderHook(() => useCategoryQuery(''), { wrapper: makeWrapper() });
    expect(result.current.fetchStatus).toBe('idle');
    expect(mockApi.get).not.toHaveBeenCalled();
  });
});

describe('category mutations', () => {
  it('creates a category', async () => {
    const cat = { id: '9', name: 'Yeni', slug: 'yeni' };
    mockApi.post.mockResolvedValue({ data: { success: true, data: cat } });

    const { result } = renderHook(() => useCreateCategoryMutation(), { wrapper: makeWrapper() });
    result.current.mutate({ name: 'Yeni' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApi.post).toHaveBeenCalledWith('/categories', { name: 'Yeni' });
    expect(result.current.data).toEqual(cat);
  });

  it('updates a category', async () => {
    const cat = { id: '9', name: 'Yeniləndi', slug: 'yeni' };
    mockApi.put.mockResolvedValue({ data: { success: true, data: cat } });

    const { result } = renderHook(() => useUpdateCategoryMutation(), { wrapper: makeWrapper() });
    result.current.mutate({ id: '9', payload: { name: 'Yeniləndi' } });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApi.put).toHaveBeenCalledWith('/categories/9', { name: 'Yeniləndi' });
  });

  it('deletes a category', async () => {
    mockApi.delete.mockResolvedValue({ data: { success: true } });

    const { result } = renderHook(() => useDeleteCategoryMutation(), { wrapper: makeWrapper() });
    result.current.mutate('9');
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApi.delete).toHaveBeenCalledWith('/categories/9');
  });

  it('uploads a category image and returns its url', async () => {
    mockApi.post.mockResolvedValue({ data: { success: true, data: { url: 'https://cdn/x.png' } } });

    const { result } = renderHook(() => useUploadCategoryImageMutation(), { wrapper: makeWrapper() });
    const file = new File(['x'], 'x.png', { type: 'image/png' });
    result.current.mutate(file);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockApi.post).toHaveBeenCalledWith(
      '/categories/upload',
      expect.any(FormData),
      expect.objectContaining({ headers: { 'Content-Type': 'multipart/form-data' } })
    );
    expect(result.current.data).toBe('https://cdn/x.png');
  });
});
