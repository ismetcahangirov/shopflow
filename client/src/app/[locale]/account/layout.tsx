// src/app/[locale]/account/layout.tsx
// Customer account section shell: storefront chrome + account sub-nav, gated to any authenticated user.

'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AccountSidebar } from '@/components/layout/AccountSidebar';

interface AccountLayoutProps {
  children: React.ReactNode;
}

export default function AccountLayout({ children }: AccountLayoutProps): React.JSX.Element {
  return (
    <ProtectedRoute>
      <div className="relative flex min-h-screen flex-col">
        <Navbar />

        <main className="flex-1">
          <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-6 md:flex-row">
              <AccountSidebar />
              <div className="min-w-0 flex-1">{children}</div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
