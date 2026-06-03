// src/store/couponStore.test.ts
// Unit tests for the Zustand couponStore

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCouponStore } from './couponStore';
import { api } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  api: {
    post: vi.fn(),
  },
  parseApiError: vi.fn((err: unknown) => {
    const error = err as { message?: string } | null | undefined;
    return error?.message ?? 'Xəta baş verdi';
  }),
}));

const mockValidateResponse = {
  data: {
    success: true,
    data: {
      coupon: { code: 'SAVE20' },
      discount: 20,
      finalTotal: 80,
    },
  },
};

describe('couponStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCouponStore.setState({ applied: null, isValidating: false, error: null });
  });

  it('initializes with default empty state', () => {
    const state = useCouponStore.getState();
    expect(state.applied).toBeNull();
    expect(state.isValidating).toBe(false);
    expect(state.error).toBeNull();
  });

  it('sets applied coupon on validateCoupon success', async () => {
    vi.mocked(api.post).mockResolvedValueOnce(mockValidateResponse);

    await useCouponStore.getState().validateCoupon('SAVE20', 100);

    const state = useCouponStore.getState();
    expect(state.applied).toEqual({ code: 'SAVE20', discount: 20, finalTotal: 80 });
    expect(state.error).toBeNull();
    expect(state.isValidating).toBe(false);
  });

  it('calls api.post with correct payload', async () => {
    vi.mocked(api.post).mockResolvedValueOnce(mockValidateResponse);

    await useCouponStore.getState().validateCoupon('  save20  ', 100);

    expect(api.post).toHaveBeenCalledWith('/coupons/validate', {
      code: 'SAVE20',
      subtotal: 100,
    });
  });

  it('sets error and clears applied on validateCoupon failure', async () => {
    const mockError = { message: 'Kupon etibarsızdır' };
    vi.mocked(api.post).mockRejectedValueOnce(mockError);

    await expect(
      useCouponStore.getState().validateCoupon('INVALID', 100)
    ).rejects.toEqual(mockError);

    const state = useCouponStore.getState();
    expect(state.applied).toBeNull();
    expect(state.error).toBe('Kupon etibarsızdır');
    expect(state.isValidating).toBe(false);
  });

  it('sets isValidating to true during validateCoupon and false after', async () => {
    let validatingDuring = false;

    vi.mocked(api.post).mockImplementationOnce(async () => {
      validatingDuring = useCouponStore.getState().isValidating;
      return mockValidateResponse;
    });

    await useCouponStore.getState().validateCoupon('SAVE20', 100);

    expect(validatingDuring).toBe(true);
    expect(useCouponStore.getState().isValidating).toBe(false);
  });

  it('clearCoupon resets applied and error to null', () => {
    useCouponStore.setState({
      applied: { code: 'SAVE20', discount: 20, finalTotal: 80 },
      error: 'some error',
    });

    useCouponStore.getState().clearCoupon();

    const state = useCouponStore.getState();
    expect(state.applied).toBeNull();
    expect(state.error).toBeNull();
  });

  it('clears previous error before new validation attempt', async () => {
    useCouponStore.setState({ error: 'old error' });

    vi.mocked(api.post).mockResolvedValueOnce(mockValidateResponse);

    await useCouponStore.getState().validateCoupon('SAVE20', 100);

    expect(useCouponStore.getState().error).toBeNull();
  });
});
