// src/store/couponStore.ts
// Zustand store for applied coupon state — validate via API, persist discount

import { create } from 'zustand';
import { api, parseApiError } from '@/lib/api';
import type { ApiResponse, CouponValidateResponse } from '@/types';

interface AppliedCoupon {
  code: string;
  discount: number;
  finalTotal: number;
}

interface CouponState {
  applied: AppliedCoupon | null;
  isValidating: boolean;
  error: string | null;

  // Actions
  validateCoupon: (code: string, subtotal: number) => Promise<void>;
  clearCoupon: () => void;
}

export const useCouponStore = create<CouponState>()((set) => ({
  applied: null,
  isValidating: false,
  error: null,

  validateCoupon: async (code: string, subtotal: number): Promise<void> => {
    set({ isValidating: true, error: null });
    try {
      const { data } = await api.post<ApiResponse<CouponValidateResponse>>(
        '/coupons/validate',
        { code: code.trim().toUpperCase(), subtotal }
      );
      set({
        applied: {
          code: data.data.coupon.code,
          discount: data.data.discount,
          finalTotal: data.data.finalTotal,
        },
        error: null,
      });
    } catch (err) {
      set({ applied: null, error: parseApiError(err) });
      throw err;
    } finally {
      set({ isValidating: false });
    }
  },

  clearCoupon: (): void => {
    set({ applied: null, error: null });
  },
}));
