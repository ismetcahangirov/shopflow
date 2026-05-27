// src/hooks/useRole.test.ts
// Unit tests for useRole hook using renderHook

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRole } from './useRole';
import { useAuthStore } from '@/store/authStore';

describe('useRole Hook', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
    });
  });

  it('returns unauthenticated state when user is null', () => {
    const { result } = renderHook(() => useRole());
    
    expect(result.current.role).toBeNull();
    expect(result.current.isCustomer).toBe(false);
    expect(result.current.isVendor).toBe(false);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('correctly maps CUSTOMER role flags', () => {
    useAuthStore.setState({
      user: {
        id: '1',
        name: 'John',
        email: 'john@example.com',
        role: 'CUSTOMER',
        createdAt: '',
      },
      isAuthenticated: true,
    });

    const { result } = renderHook(() => useRole());
    
    expect(result.current.role).toBe('CUSTOMER');
    expect(result.current.isCustomer).toBe(true);
    expect(result.current.isVendor).toBe(false);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('correctly maps VENDOR role flags', () => {
    useAuthStore.setState({
      user: {
        id: '2',
        name: 'Store Owner',
        email: 'vendor@example.com',
        role: 'VENDOR',
        createdAt: '',
      },
      isAuthenticated: true,
    });

    const { result } = renderHook(() => useRole());
    
    expect(result.current.role).toBe('VENDOR');
    expect(result.current.isCustomer).toBe(false);
    expect(result.current.isVendor).toBe(true);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('correctly maps ADMIN role flags', () => {
    useAuthStore.setState({
      user: {
        id: '3',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'ADMIN',
        createdAt: '',
      },
      isAuthenticated: true,
    });

    const { result } = renderHook(() => useRole());
    
    expect(result.current.role).toBe('ADMIN');
    expect(result.current.isCustomer).toBe(false);
    expect(result.current.isVendor).toBe(false);
    expect(result.current.isAdmin).toBe(true);
    expect(result.current.isAuthenticated).toBe(true);
  });
});
