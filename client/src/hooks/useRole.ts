// src/hooks/useRole.ts
// Returns the current user's role from the auth store
// Safe to use in both client components and hooks

'use client';

import { useAuthStore } from '@/store/authStore';
import type { UserRole } from '@/types';

interface UseRoleReturn {
  role: UserRole | null;
  isCustomer: boolean;
  isVendor: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
}

export function useRole(): UseRoleReturn {
  const { user } = useAuthStore();

  const role = user?.role ?? null;

  return {
    role,
    isCustomer: role === 'CUSTOMER',
    isVendor: role === 'VENDOR',
    isAdmin: role === 'ADMIN',
    isAuthenticated: user !== null,
  };
}
