// src/app/[locale]/(shop)/cart/CartPageClient.tsx
// Client-side cart manager component rendering item list, quantities, and order summaries with interactive clear triggers

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Trash2, ArrowLeft, Loader2, Lock } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { CartItem } from '@/components/cart/CartItem';
import { CartSummary } from '@/components/cart/CartSummary';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export function CartPageClient(): React.JSX.Element {
  const t = useTranslations('cart');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const { cart, isLoading, isMutating, fetchCart, clearCart, isHydrated } = useCartStore();
  const { isAuthenticated, isHydrated: isAuthHydrated } = useAuthStore();
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [clearing, setClearing] = useState(false);

  // Fetch fresh cart details on mount if logged in
  useEffect(() => {
    if (isAuthHydrated && isAuthenticated) {
      fetchCart();
    }
  }, [isAuthHydrated, isAuthenticated, fetchCart]);

  const handleClearCart = async () => {
    setClearing(true);
    try {
      await clearCart();
    } catch {
      // Error handled by store
    } finally {
      setClearing(false);
      setClearDialogOpen(false);
    }
  };

  // 1. Loading/Hydration State
  if (!isHydrated || !isAuthHydrated || isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600 dark:text-indigo-400" />
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 font-medium">
          {tCommon('loading')}
        </p>
      </div>
    );
  }

  // 2. Unauthenticated State
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mb-6">
          <Lock className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Giriş edilməyib
        </h1>
        <p className="text-sm text-slate-550 dark:text-slate-400 mb-6">
          Səbətinizi görmək və sifariş etmək üçün zəhmət olmasa hesabınıza daxil olun.
        </p>
        <Link
          href={`/${locale}/login?redirect=/cart`}
          className="inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/10 hover:bg-indigo-700 transition-all"
        >
          {tCommon('login')}
        </Link>
      </div>
    );
  }

  const items = cart?.items || [];

  // 3. Empty Cart State
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 mb-6">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
          {t('empty')}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
          Səbətinizdə hazırda heç bir məhsul yoxdur. Alış-verişə başlayaraq bəyəndiyiniz məhsulları əlavə edin.
        </p>
        <Link
          href={`/${locale}/products`}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/10 hover:bg-indigo-700 transition-all hover:shadow-indigo-600/20 active:scale-[0.98]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Məhsullara keç</span>
        </Link>
      </div>
    );
  }

  // 4. Full Cart State
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Title Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-slate-100 dark:border-slate-850 pb-6 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('title')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Səbətinizdə <span className="font-bold text-slate-700 dark:text-slate-200">{cart?.itemCount} məhsul</span> var
          </p>
        </div>

        {/* Clear Cart Trigger */}
        <button
          onClick={() => setClearDialogOpen(true)}
          disabled={isMutating || clearing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-rose-950/20 transition-all self-start md:self-auto"
        >
          {clearing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          <span>Səbəti təmizlə</span>
        </button>
      </div>

      {/* Two Column Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Items List */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white p-6 shadow-sm dark:bg-slate-900">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {items.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>
        </div>

        {/* Right Side: Summary Card */}
        <div className="lg:col-span-4 lg:sticky lg:top-24">
          <CartSummary cart={cart!} />
        </div>
      </div>

      {/* Confirmation modal dialog for clearing cart */}
      <ConfirmDialog
        isOpen={clearDialogOpen}
        onClose={() => setClearDialogOpen(false)}
        onConfirm={handleClearCart}
        title="Səbəti təmizlə"
        message="Səbətinizdəki bütün məhsulları silmək istədiyinizdən əminsiniz? Bu əməliyyat geri qaytarıla bilməz."
        confirmText="Bəli, təmizlə"
        cancelText="Ləğv et"
        variant="destructive"
      />
    </div>
  );
}
