// src/components/cart/CartDrawer.tsx
// Sliding offcanvas sidebar displaying interactive cart summary and items

'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { X, ShoppingBag, ArrowRight } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { useUiStore } from '@/store/uiStore';
import { useCartStore } from '@/store/cartStore';
import { CartItem } from './CartItem';

export function CartDrawer(): React.JSX.Element | null {
  const t = useTranslations('cart');
  const locale = useLocale();
  const { isCartOpen, closeCart } = useUiStore();
  const { cart, fetchCart, isHydrated } = useCartStore();

  // Fetch cart only when the drawer opens
  useEffect(() => {
    if (isCartOpen) {
      fetchCart();
    }
  }, [isCartOpen, fetchCart]);

  // Lock scroll when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const items = cart?.items || [];
  const itemCount = cart?.itemCount || 0;
  const subtotal = cart?.subtotal || 0;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={closeCart}
      />

      {/* Drawer content panel */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl dark:bg-slate-900 animate-in slide-in-from-right duration-250">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-5">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {t('title')}
            </h2>
            {isHydrated && itemCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-50 px-1.5 text-xs font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                {itemCount}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700 dark:hover:bg-slate-850 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drawer Body — Scrollable items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {!isHydrated || items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="rounded-full bg-slate-50 p-4 dark:bg-slate-850">
                <ShoppingBag className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-800 dark:text-slate-200">
                {t('empty')}
              </h3>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 max-w-[240px]">
                Səbətiniz hələ ki boşdur. Ən son məhsullarımızı kəşf edin!
              </p>
              <button
                onClick={closeCart}
                className="mt-6 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 transition-all active:scale-[0.98]"
              >
                Alış-verişə başla
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {isHydrated && items.length > 0 && (
          <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-6 py-6 space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-slate-500 dark:text-slate-400">
                {t('subtotal')}
              </span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                {subtotal.toFixed(2)} AZN
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3.5 pt-2">
              <Link
                href={`/${locale}/cart`}
                onClick={closeCart}
                className="flex items-center justify-center rounded-xl border border-slate-200 bg-white py-3 text-center text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-850 dark:text-slate-200 dark:hover:bg-slate-800 transition-all"
              >
                Səbətə get
              </Link>
              <Link
                href={`/${locale}/checkout`}
                onClick={closeCart}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-3 text-center text-xs font-bold text-white shadow-lg shadow-indigo-600/10 hover:bg-indigo-700 dark:shadow-indigo-600/5 transition-all"
              >
                <span>{t('checkout')}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
