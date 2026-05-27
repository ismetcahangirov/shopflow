// src/components/layout/BottomTabs.tsx
// Mobile quick navigation bottom bar using role-based items

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Home, Package, ShoppingCart, User, ClipboardList, LayoutDashboard } from 'lucide-react';
import { useRole } from '@/hooks/useRole';
import { useUiStore } from '@/store/uiStore';
import { useCartStore } from '@/store/cartStore';

export function BottomTabs(): React.JSX.Element {
  const t = useTranslations('common');
  const locale = useLocale();
  const pathname = usePathname();
  const { isAuthenticated, isVendor, isAdmin } = useRole();
  const { openCart } = useUiStore();
  const { cart, isHydrated: isCartHydrated } = useCartStore();

  const isActive = (href: string) => {
    const localizedHref = `/${locale}${href === '/' ? '' : href}`;
    return pathname === localizedHref;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/90 pb-safe backdrop-blur-lg dark:border-slate-850 dark:bg-slate-950/90 md:hidden transition-all duration-300 shadow-[0_-4px_16px_-4px_rgba(0,0,0,0.05)]">
      <div className="flex h-16 items-center justify-around px-2">
        {/* Home */}
        <Link
          href={`/${locale}`}
          className={[
            'flex flex-col items-center justify-center gap-1 w-12 h-12 rounded-xl transition-all focus:outline-none',
            isActive('/') 
              ? 'text-indigo-600 dark:text-indigo-400' 
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
          ].join(' ')}
        >
          <Home className="h-5 w-5" />
          <span className="text-[10px] font-bold">{t('home')}</span>
        </Link>

        {/* Products */}
        <Link
          href={`/${locale}/products`}
          className={[
            'flex flex-col items-center justify-center gap-1 w-12 h-12 rounded-xl transition-all focus:outline-none',
            isActive('/products') 
              ? 'text-indigo-600 dark:text-indigo-400' 
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
          ].join(' ')}
        >
          <Package className="h-5 w-5" />
          <span className="text-[10px] font-bold">{t('products')}</span>
        </Link>

        {/* Cart Trigger */}
        <button
          type="button"
          onClick={openCart}
          className="flex flex-col items-center justify-center gap-1 w-12 h-12 rounded-xl text-slate-500 focus:outline-none relative"
        >
          <ShoppingCart className="h-5 w-5" />
          <span className="text-[10px] font-bold">{t('cart')}</span>
          {isCartHydrated && cart && cart.itemCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-indigo-600 text-[9px] font-bold text-white flex items-center justify-center">
              {cart.itemCount}
            </span>
          )}
        </button>

        {/* Conditional Role Action / Auth */}
        {isAuthenticated ? (
          <>
            {isVendor && (
              <Link
                href={`/${locale}/vendor`}
                className={[
                  'flex flex-col items-center justify-center gap-1 w-12 h-12 rounded-xl transition-all focus:outline-none',
                  isActive('/vendor') 
                    ? 'text-indigo-600 dark:text-indigo-400' 
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                ].join(' ')}
              >
                <LayoutDashboard className="h-5 w-5 text-purple-500" />
                <span className="text-[10px] font-bold">{t('nav_dashboard')}</span>
              </Link>
            )}
            {isAdmin && (
              <Link
                href={`/${locale}/admin`}
                className={[
                  'flex flex-col items-center justify-center gap-1 w-12 h-12 rounded-xl transition-all focus:outline-none',
                  isActive('/admin') 
                    ? 'text-indigo-600 dark:text-indigo-400' 
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                ].join(' ')}
              >
                <LayoutDashboard className="h-5 w-5 text-indigo-500" />
                <span className="text-[10px] font-bold">{t('nav_dashboard')}</span>
              </Link>
            )}
            {!isVendor && !isAdmin && (
              <Link
                href={`/${locale}/account/orders`}
                className={[
                  'flex flex-col items-center justify-center gap-1 w-12 h-12 rounded-xl transition-all focus:outline-none',
                  isActive('/account/orders') 
                    ? 'text-indigo-600 dark:text-indigo-400' 
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                ].join(' ')}
              >
                <ClipboardList className="h-5 w-5" />
                <span className="text-[10px] font-bold">{t('nav_orders')}</span>
              </Link>
            )}
          </>
        ) : (
          <Link
            href={`/${locale}/login`}
            className={[
              'flex flex-col items-center justify-center gap-1 w-12 h-12 rounded-xl transition-all focus:outline-none',
              isActive('/login') 
                ? 'text-indigo-600 dark:text-indigo-400' 
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            ].join(' ')}
          >
            <User className="h-5 w-5" />
            <span className="text-[10px] font-bold">{t('login')}</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
