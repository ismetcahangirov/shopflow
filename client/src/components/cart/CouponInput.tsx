// src/components/cart/CouponInput.tsx
// Coupon code input with 3 states: idle, success (green), error (red)

'use client';

import React, { useState } from 'react';
import { Tag, CheckCircle2, XCircle, Loader2, X } from 'lucide-react';
import { useCouponStore } from '@/store/couponStore';

interface CouponInputProps {
  subtotal: number;
}

export function CouponInput({ subtotal }: CouponInputProps): React.JSX.Element {
  const [inputValue, setInputValue] = useState('');
  const { applied, isValidating, error, validateCoupon, clearCoupon } = useCouponStore();

  const handleApply = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    try {
      await validateCoupon(inputValue.trim(), subtotal);
      setInputValue('');
    } catch {
      // Error already set in store
    }
  };

  const handleClear = (): void => {
    clearCoupon();
    setInputValue('');
  };

  // ── Applied (Success) state ───────────────────────────────
  if (applied) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800/50 dark:bg-emerald-950/20">
        <div className="flex items-center gap-2.5 min-w-0">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 truncate">
              {applied.code}
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-0.5">
              −{applied.discount.toFixed(2)} AZN endirim tətbiq edildi
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleClear}
          aria-label="Kuponu sil"
          className="shrink-0 rounded-lg p-1 text-emerald-600 hover:bg-emerald-100 dark:text-emerald-400 dark:hover:bg-emerald-900/30 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  // ── Idle / Error state ─────────────────────────────────────
  return (
    <div className="space-y-2">
      <form onSubmit={handleApply} className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input
            id="coupon-code-input"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value.toUpperCase())}
            placeholder="Kupon kodu"
            disabled={isValidating}
            autoComplete="off"
            spellCheck={false}
            className={[
              'w-full rounded-xl border py-2.5 pl-9 pr-3 text-sm font-mono font-bold tracking-widest',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-colors',
              'disabled:cursor-not-allowed disabled:opacity-60',
              error
                ? 'border-red-300 bg-red-50 text-red-800 placeholder-red-300 dark:border-red-800/50 dark:bg-red-950/10 dark:text-red-300 dark:placeholder-red-700'
                : 'border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder-slate-600',
            ].join(' ')}
          />
        </div>

        <button
          type="submit"
          id="coupon-apply-button"
          disabled={isValidating || !inputValue.trim()}
          className="shrink-0 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
        >
          {isValidating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Tətbiq et'
          )}
        </button>
      </form>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
          <XCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
