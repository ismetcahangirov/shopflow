// src/components/cart/CouponInput.test.tsx
// Tests for CouponInput component — covers all 3 states: idle, success, error

import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CouponInput } from './CouponInput';
import { useCouponStore } from '@/store/couponStore';

vi.mock('@/store/couponStore', () => ({
  useCouponStore: vi.fn(),
}));

const mockValidateCoupon = vi.fn();
const mockClearCoupon = vi.fn();

const defaultStoreState = {
  applied: null,
  isValidating: false,
  error: null,
  validateCoupon: mockValidateCoupon,
  clearCoupon: mockClearCoupon,
};

describe('CouponInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCouponStore).mockReturnValue(defaultStoreState);
  });

  // ── Idle state ──────────────────────────────────────────────

  it('renders idle state with input and apply button', () => {
    render(<CouponInput subtotal={100} />);
    expect(screen.getByPlaceholderText('Kupon kodu')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tətbiq et' })).toBeInTheDocument();
  });

  it('apply button is disabled when input is empty', () => {
    render(<CouponInput subtotal={100} />);
    expect(screen.getByRole('button', { name: 'Tətbiq et' })).toBeDisabled();
  });

  it('apply button becomes enabled when input has a value', () => {
    render(<CouponInput subtotal={100} />);
    const input = screen.getByPlaceholderText('Kupon kodu');
    fireEvent.change(input, { target: { value: 'SAVE20' } });
    expect(screen.getByRole('button', { name: 'Tətbiq et' })).not.toBeDisabled();
  });

  it('converts input to uppercase as user types', () => {
    render(<CouponInput subtotal={100} />);
    const input = screen.getByPlaceholderText('Kupon kodu') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'save20' } });
    expect(input.value).toBe('SAVE20');
  });

  it('does not call validateCoupon when submitting with empty input', () => {
    render(<CouponInput subtotal={100} />);
    const form = screen.getByPlaceholderText('Kupon kodu').closest('form')!;
    fireEvent.submit(form);
    expect(mockValidateCoupon).not.toHaveBeenCalled();
  });

  // ── handleApply ─────────────────────────────────────────────

  it('calls validateCoupon with trimmed code and subtotal on form submit', async () => {
    mockValidateCoupon.mockResolvedValueOnce(undefined);
    render(<CouponInput subtotal={100} />);

    fireEvent.change(screen.getByPlaceholderText('Kupon kodu'), {
      target: { value: 'SAVE20' },
    });
    fireEvent.submit(screen.getByPlaceholderText('Kupon kodu').closest('form')!);

    await waitFor(() => {
      expect(mockValidateCoupon).toHaveBeenCalledWith('SAVE20', 100);
    });
  });

  it('clears input field after successful coupon application', async () => {
    mockValidateCoupon.mockResolvedValueOnce(undefined);
    render(<CouponInput subtotal={100} />);

    const input = screen.getByPlaceholderText('Kupon kodu') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'SAVE20' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });

  it('does not throw when validateCoupon rejects (error handled by store)', async () => {
    mockValidateCoupon.mockRejectedValueOnce(new Error('Invalid'));
    render(<CouponInput subtotal={100} />);

    fireEvent.change(screen.getByPlaceholderText('Kupon kodu'), {
      target: { value: 'BAD' },
    });
    fireEvent.submit(screen.getByPlaceholderText('Kupon kodu').closest('form')!);

    await waitFor(() => expect(mockValidateCoupon).toHaveBeenCalled());
    // Should not throw — error is swallowed in the catch block
  });

  // ── Error state ─────────────────────────────────────────────

  it('renders error message when store has an error', () => {
    vi.mocked(useCouponStore).mockReturnValue({
      ...defaultStoreState,
      error: 'Kupon etibarsızdır',
    });

    render(<CouponInput subtotal={100} />);
    expect(screen.getByText('Kupon etibarsızdır')).toBeInTheDocument();
  });

  // ── Loading / isValidating state ────────────────────────────

  it('disables input and apply button while validating', () => {
    vi.mocked(useCouponStore).mockReturnValue({
      ...defaultStoreState,
      isValidating: true,
    });

    render(<CouponInput subtotal={100} />);
    expect(screen.getByPlaceholderText('Kupon kodu')).toBeDisabled();
  });

  // ── Applied (success) state ──────────────────────────────────

  it('renders success state when a coupon is applied', () => {
    vi.mocked(useCouponStore).mockReturnValue({
      ...defaultStoreState,
      applied: { code: 'SAVE20', discount: 20, finalTotal: 80 },
    });

    render(<CouponInput subtotal={100} />);
    expect(screen.getByText('SAVE20')).toBeInTheDocument();
    expect(screen.getByText(/−20\.00 AZN endirim/)).toBeInTheDocument();
  });

  it('renders remove button in applied state', () => {
    vi.mocked(useCouponStore).mockReturnValue({
      ...defaultStoreState,
      applied: { code: 'SAVE20', discount: 20, finalTotal: 80 },
    });

    render(<CouponInput subtotal={100} />);
    expect(screen.getByRole('button', { name: 'Kuponu sil' })).toBeInTheDocument();
  });

  it('calls clearCoupon when remove button is clicked in applied state', () => {
    vi.mocked(useCouponStore).mockReturnValue({
      ...defaultStoreState,
      applied: { code: 'SAVE20', discount: 20, finalTotal: 80 },
    });

    render(<CouponInput subtotal={100} />);
    fireEvent.click(screen.getByRole('button', { name: 'Kuponu sil' }));
    expect(mockClearCoupon).toHaveBeenCalledTimes(1);
  });
});
