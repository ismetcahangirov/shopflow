// src/components/cart/CartSummary.tsx
// Order Summary Card with shipping calculations and progress bar towards Free Shipping

'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import type { Cart } from '@/types';

interface CartSummaryProps {
  cart: Cart;
}

export function CartSummary({ cart }: CartSummaryProps): React.JSX.Element {
  const t = useTranslations('cart');
  const locale = useLocale();

  const subtotal = cart.subtotal;
  
  // Free shipping threshold at 150 AZN
  const FREE_SHIPPING_THRESHOLD = 150;
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 5.00;
  const total = subtotal + shippingCost;

  // Free shipping progress percentage
  const progressPercent = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const remainingForFreeShipping = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white p-6 shadow-sm dark:bg-slate-900 space-y-6">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
        {t('summary')}
      </h2>

      {/* Free Shipping Progress Alert */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-350">
          {shippingCost === 0 ? (
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              Təbrik edirik! Pulsuz çatdırılma qazandınız.
            </span>
          ) : (
            <span>
              Pulsuz çatdırılma üçün daha <span className="font-bold text-indigo-600 dark:text-indigo-400">{remainingForFreeShipping.toFixed(2)} AZN</span> lazımdır.
            </span>
          )}
        </div>
        <div className="h-2 w-full bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Pricing Lines */}
      <div className="divide-y divide-slate-100 dark:divide-slate-850 space-y-4">
        <div className="space-y-3 pb-4">
          <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
            <span>{t('subtotal')}</span>
            <span className="font-semibold text-slate-850 dark:text-slate-200">
              {subtotal.toFixed(2)} AZN
            </span>
          </div>

          <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
            <span>{t('shipping')}</span>
            <span className="font-semibold text-slate-850 dark:text-slate-200">
              {shippingCost === 0 ? 'Pulsuz' : `${shippingCost.toFixed(2)} AZN`}
            </span>
          </div>
        </div>

        {/* Total Price */}
        <div className="flex justify-between items-center pt-4">
          <span className="text-base font-bold text-slate-900 dark:text-white">
            {t('total')}
          </span>
          <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {total.toFixed(2)} AZN
          </span>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-2">
        <Link
          href={`/${locale}/checkout`}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-center text-sm font-bold text-white shadow-lg shadow-indigo-600/10 hover:bg-indigo-700 hover:shadow-indigo-600/20 active:scale-[0.98] transition-all duration-200"
        >
          <span>{t('checkout')}</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
