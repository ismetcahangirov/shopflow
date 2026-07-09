import React from 'react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import VendorOrdersPage from './orders/page';
import { useVendorOrders } from '@/hooks/useVendor';

vi.mock('next-intl', () => ({
  useTranslations: (namespace?: string) => (key: string, vars?: Record<string, unknown>) =>
    namespace ? `${namespace}.${key}${vars ? ` ${JSON.stringify(vars)}` : ''}` : key,
}));

vi.mock('@/hooks/useVendor', () => ({ useVendorOrders: vi.fn() }));

const page1 = {
  data: [
    { id: 'o1', orderNumber: 'ORD-1', status: 'DELIVERED', paymentStatus: 'PAID', createdAt: '2026-06-02T00:00:00.000Z', vendorSubtotal: 120, vendorItemCount: 2 },
    { id: 'o2', orderNumber: 'ORD-2', status: 'PENDING', paymentStatus: 'UNPAID', createdAt: '2026-06-03T00:00:00.000Z', vendorSubtotal: 60, vendorItemCount: 1 },
  ],
  pagination: { total: 12, pages: 2, page: 1, limit: 10 },
};

describe('VendorOrdersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useVendorOrders as Mock).mockReturnValue({ data: page1, isLoading: false, isError: false, error: null, refetch: vi.fn() });
  });

  it('renders vendor-scoped rows with the vendor subtotal and pagination', () => {
    render(<VendorOrdersPage />);
    expect(screen.getByText('#ORD-1')).toBeInTheDocument();
    expect(screen.getByText('120.00 AZN')).toBeInTheDocument();
    expect(screen.getByText(/vendor\.page_of/)).toBeInTheDocument();
  });

  it('selecting a status filter re-queries scoped to that status and resets to page 1', () => {
    render(<VendorOrdersPage />);
    fireEvent.click(screen.getByRole('button', { name: 'orders.status_delivered' }));
    expect(useVendorOrders).toHaveBeenLastCalledWith({ page: 1, limit: 10, status: 'DELIVERED' });
  });

  it('paginates to the next page', () => {
    render(<VendorOrdersPage />);
    fireEvent.click(screen.getByRole('button', { name: /vendor\.next/ }));
    expect(useVendorOrders).toHaveBeenLastCalledWith({ page: 2, limit: 10, status: undefined });
  });

  it('shows the empty state when there are no orders', () => {
    (useVendorOrders as Mock).mockReturnValue({ data: { data: [], pagination: { total: 0, pages: 1, page: 1, limit: 10 } }, isLoading: false, isError: false, error: null, refetch: vi.fn() });
    render(<VendorOrdersPage />);
    expect(screen.getByText('orders.no_orders')).toBeInTheDocument();
  });
});
