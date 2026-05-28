// src/components/cart/CartSummary.tsx
// Order Summary Card with coupon input, shipping calculations and free-shipping progress bar

'use client';

import React from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import type { Cart } from '@/types';
import { CouponInput } from './CouponInput';
import { useCouponStore } from '@/store/couponStore';

const FREE_SHIPPING_THRESHOLD = 150;
const SHIPPING_COST = 5.0;

interface CartSummaryProps {
  cart: Cart;
}

export function CartSummary({ cart }: CartSummaryProps): React.JSX.Element {
  const locale = useLocale();
  const t = useTranslations('cart');
  const { applied } = useCouponStore();

  const subtotal = cart.subtotal;
  const discount = applied?.discount ?? 0;
  const discountedSubtotal = Math.max(subtotal - discount, 0);
  const shippingCost = discountedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = discountedSubtotal + shippingCost;

  // Free shipping progress (based on discounted subtotal)
  const progressPercent = Math.min(
    (discountedSubtotal / FREE_SHIPPING_THRESHOLD) * 100,
    100
  );
  const remainingForFreeShipping = Math.max(FREE_SHIPPING_THRESHOLD - discountedSubtotal, 0);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white p-6 shadow-sm dark:bg-slate-900 space-y-5">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
        {t('summary')}
      </h2>

      {/* Free Shipping Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-medium text-slate-700 dark:text-slate-350">
          {shippingCost === 0 ? (
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              {t('free_shipping_congrats')}
            </span>
          ) : (
            <span>
              {t('free_shipping_remaining', { amount: remainingForFreeShipping.toFixed(2) })}
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

      {/* Coupon Input */}
      <CouponInput subtotal={subtotal} />

      {/* Pricing Lines */}
      <div className="divide-y divide-slate-100 dark:divide-slate-850 space-y-4">
        <div className="space-y-3 pb-4">
          {/* Subtotal */}
          <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
            <span>{t('subtotal')}</span>
            <span className="font-semibold text-slate-850 dark:text-slate-200">
              {subtotal.toFixed(2)} AZN
            </span>
          </div>

          {/* Discount row — only shown when coupon applied */}
          {discount > 0 && (
            <div className="flex justify-between text-sm text-emerald-700 dark:text-emerald-400">
              <span className="font-semibold">{t('discount')} ({applied?.code})</span>
              <span className="font-bold">−{discount.toFixed(2)} AZN</span>
            </div>
          )}

          {/* Shipping */}
          <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
            <span>{t('shipping')}</span>
            <span className="font-semibold text-slate-850 dark:text-slate-200">
              {shippingCost === 0 ? t('free') : `${shippingCost.toFixed(2)} AZN`}
            </span>
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-between items-center pt-4">
          <span className="text-base font-bold text-slate-900 dark:text-white">
            {t('total')}
          </span>
          <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {total.toFixed(2)} AZN
          </span>
        </div>
      </div>

      {/* Checkout CTA */}
      <div className="pt-1">
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
