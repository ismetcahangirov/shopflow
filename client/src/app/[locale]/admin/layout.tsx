// src/app/[locale]/admin/layout.tsx
// Admin dashboard wrapper: wraps children with role-based auth guard and dashboard structure

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Shield, Menu, X, LogOut, Bell } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { useAuthStore } from '@/store/authStore';
import { adminNavItems } from '@/config/navItems';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps): React.JSX.Element {
  const t = useTranslations('common');
  const locale = useLocale();
  const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-200 transition-colors duration-300 flex">
        
        {/* Sidebar Component (Visible on Desktop) */}
        <AdminSidebar />

        {/* Mobile Menu Backdrop */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 z-45 bg-slate-950/40 backdrop-blur-sm md:hidden animate-in fade-in duration-200" 
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Menu Sidebar Drawer */}
        <aside 
          className={[
            'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-905 p-5 shadow-2xl flex flex-col justify-between md:hidden transform transition-transform duration-300',
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          ].join(' ')}
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-indigo-600" />
                <span className="font-extrabold text-slate-900 dark:text-white">Admin Panel</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="space-y-1">
              {adminNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={`/${locale}${item.href}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-350 dark:hover:bg-slate-900 transition-all duration-200"
                >
                  <item.icon className="h-4.5 w-4.5 text-slate-400" />
                  <span>{t(item.label)}</span>
                </Link>
              ))}
            </nav>
          </div>
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/20 focus:outline-none"
            >
              <LogOut className="h-5 w-5" />
              <span>Çıxış</span>
            </button>
          </div>
        </aside>

        {/* Content Wrapper */}
        <div className="flex-1 md:pl-64 flex flex-col min-w-0">
          {/* Header Panel */}
          <header className="sticky top-0 z-30 h-16 border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/80 flex items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900 md:hidden focus:outline-none"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-block px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-650 dark:text-indigo-400 font-extrabold text-xs">
                  Sistem Rəhbəri
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              
              <button className="p-2 rounded-xl text-slate-500 hover:bg-slate-50 dark:text-slate-450 dark:hover:bg-slate-900 relative focus:outline-none">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-600 ring-2 ring-white dark:ring-slate-950" />
              </button>

              <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white font-bold text-xs">
                  {user?.name ? user.name[0].toUpperCase() : 'A'}
                </div>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 hidden sm:inline-block">
                  {user?.name}
                </span>
              </div>
            </div>
          </header>

          {/* Actual Admin Page View */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>

      </div>
    </ProtectedRoute>
  );
}
