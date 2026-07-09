// src/app/[locale]/admin/layout.tsx
// Admin dashboard shell: role-based auth guard + collapsible shadcn sidebar
// (AppSidebar) and topbar (AdminTopbar). See #76.

'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AppSidebar } from '@/components/admin/AppSidebar';
import { AdminTopbar } from '@/components/admin/AdminTopbar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * Read the persisted sidebar collapse state (shadcn writes `sidebar_state` as a
 * cookie). The sidebar only mounts client-side (ProtectedRoute renders a spinner
 * until hydration), so reading the cookie here cannot cause a hydration mismatch.
 */
function readSidebarDefaultOpen(): boolean {
  if (typeof document === 'undefined') return true;
  const match = document.cookie.match(/(?:^|;\s*)sidebar_state=([^;]+)/);
  return match ? match[1] !== 'false' : true;
}

export default function AdminLayout({ children }: AdminLayoutProps): React.JSX.Element {
  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <TooltipProvider>
        <SidebarProvider defaultOpen={readSidebarDefaultOpen()}>
          <AppSidebar />
          <SidebarInset>
            <AdminTopbar />
            <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    </ProtectedRoute>
  );
}
