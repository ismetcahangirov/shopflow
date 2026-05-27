// src/components/auth/ProtectedRoute.tsx
// Client-side auth guard: shows skeleton while hydrating, redirects if unauthenticated
// Use ONLY for client-rendered sections. Route-level protection is in middleware.ts.

'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import type { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** If provided, only users with one of these roles can render children */
  allowedRoles?: UserRole[];
  /** Where to redirect unauthenticated users. Defaults to /login */
  redirectTo?: string;
  /** Fallback UI while hydration resolves. Defaults to a full-screen spinner */
  fallback?: React.ReactNode;
}

const DefaultFallback = (): React.JSX.Element => (
  <div className="flex min-h-screen items-center justify-center">
    <span className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
  </div>
);

export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = '/login',
  fallback = <DefaultFallback />,
}: ProtectedRouteProps): React.JSX.Element {
  const { user, isHydrated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isHydrated) return;

    // Not authenticated → redirect to login
    if (!user) {
      router.replace(redirectTo);
      return;
    }

    // Authenticated but wrong role → redirect to unauthorized
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.replace('/unauthorized');
    }
  }, [isHydrated, user, allowedRoles, redirectTo, router]);

  // Still hydrating
  if (!isHydrated) return <>{fallback}</>;

  // Not yet redirected (useEffect hasn't fired) — show nothing to avoid flash
  if (!user) return <></>;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <></>;

  return <>{children}</>;
}
