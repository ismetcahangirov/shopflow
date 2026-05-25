// src/store/authStore.test.ts
// Unit tests for the Zustand authStore

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore, type User } from './authStore';
import { api } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
  parseApiError: vi.fn((err: unknown) => {
    const errorObj = err as Record<string, unknown> | null;
    return typeof errorObj?.message === 'string' ? errorObj.message : 'Xəta baş verdi';
  }),
}));

const mockUser: User = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'İsmət Cahangirov',
  role: 'CUSTOMER',
  createdAt: new Date().toISOString(),
};

describe('authStore tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    if (typeof window !== 'undefined') {
      (window as typeof window & { __accessToken?: string }).__accessToken = undefined;
    }
  });

  it('should initialize with default states', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should set user and update authenticated state', () => {
    const store = useAuthStore.getState();
    store.setUser(mockUser);
    
    const updatedState = useAuthStore.getState();
    expect(updatedState.user).toEqual(mockUser);
    expect(updatedState.isAuthenticated).toBe(true);

    store.setUser(null);
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('should set tokens correctly in window object and handle cookies', () => {
    const store = useAuthStore.getState();
    store.setUser(mockUser);
    store.setToken('fake-jwt-token');

    expect((window as typeof window & { __accessToken?: string }).__accessToken).toBe('fake-jwt-token');
    expect(document.cookie).toContain('userRole=CUSTOMER');
  });

  it('should handle successful login flow or checkAuth verification', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({
      data: { success: true, data: { accessToken: 'valid-token' } },
    });
    vi.mocked(api.get).mockResolvedValueOnce({
      data: { success: true, data: mockUser },
    });

    const store = useAuthStore.getState();
    await store.checkAuth();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(mockUser);
    expect((window as typeof window & { __accessToken?: string }).__accessToken).toBe('valid-token');
  });

  it('should handle checkAuth failure correctly', async () => {
    vi.mocked(api.post).mockRejectedValueOnce(new Error('Refresh failed'));

    const store = useAuthStore.getState();
    await store.checkAuth();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect((window as typeof window & { __accessToken?: string }).__accessToken).toBeUndefined();
  });

  it('should clear states completely on logout', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ success: true });
    
    const store = useAuthStore.getState();
    store.setUser(mockUser);
    store.setToken('my-token');

    await store.logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect((window as typeof window & { __accessToken?: string }).__accessToken).toBeUndefined();
  });
});
