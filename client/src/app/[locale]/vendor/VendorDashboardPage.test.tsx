import React from 'react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import VendorPage from './page';
import { useMyVendor, useVendorDashboard } from '@/hooks/useVendor';

vi.mock('next-intl', () => ({
  useTranslations: (namespace?: string) => (key: string, vars?: Record<string, unknown>) =>
    namespace ? `${namespace}.${key}${vars ? ` ${JSON.stringify(vars)}` : ''}` : key,
}));

vi.mock('@/hooks/useVendor', () => ({
  useMyVendor: vi.fn(),
  useVendorDashboard: vi.fn(),
}));

/* eslint-disable @typescript-eslint/no-explicit-any */
vi.mock('@/components/admin/charts/TimeSeriesChart', () => ({
  TimeSeriesChart: ({ yKey, data }: any) => <div data-testid={`timeseries-${yKey}`}>points:{data.length}</div>,
}));
/* eslint-enable @typescript-eslint/no-explicit-any */

const dashboard = {
  summary: { totalProducts: 5, totalOrders: 12, totalRevenue: 3400, pendingOrders: 3, avgRating: 4.6, avgOrderValue: 283.33 },
  revenueChart: [
    { date: '2026-06-01', revenue: 100, orders: 2 },
    { date: '2026-06-02', revenue: 200, orders: 3 },
  ],
  topProducts: [{ id: 'p1', name: 'Wireless Mouse', salesCount: 20, revenue: 800 }],
  lowStockProducts: [{ id: 'p2', name: 'USB Cable', stock: 2, lowStockAlert: 5 }],
  recentOrders: [{ id: 'o1', orderNumber: 'ORD-900', vendorSubtotal: 150, status: 'DELIVERED', createdAt: '2026-06-02T00:00:00.000Z', user: { name: 'Ann' } }],
  ordersByStatus: { PENDING: 3, DELIVERED: 9 },
};

function mockVendor(status = 'APPROVED') {
  (useMyVendor as Mock).mockReturnValue({ data: { storeName: 'My Store', status } });
}

describe('VendorPage (dashboard)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockVendor('APPROVED');
    (useVendorDashboard as Mock).mockReturnValue({ data: dashboard, isLoading: false, isError: false, error: null, refetch: vi.fn() });
  });

  it('renders KPIs, revenue chart, recent orders, low-stock and top products', () => {
    render(<VendorPage />);
    expect(screen.getByText('5')).toBeInTheDocument(); // totalProducts
    expect(screen.getByText('3,400.00 AZN')).toBeInTheDocument(); // revenue
    expect(screen.getByText('4.6')).toBeInTheDocument(); // avg rating
    expect(screen.getByTestId('timeseries-revenue')).toHaveTextContent('points:2');
    expect(screen.getByText('ORD-900')).toBeInTheDocument();
    expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
    expect(screen.getByText('USB Cable')).toBeInTheDocument();
    // recent-orders "view all" links to the vendor orders page
    expect(screen.getByRole('link', { name: /view_all/i })).toHaveAttribute('href', '/vendor/orders');
  });

  it('shows the pending-orders alert', () => {
    render(<VendorPage />);
    expect(screen.getByText(/vendor\.pending_orders_warning/)).toBeInTheDocument();
  });

  it('renders the approval banner and hides the dashboard when not approved', () => {
    mockVendor('PENDING');
    render(<VendorPage />);
    expect(screen.getByText('vendor.approval_required')).toBeInTheDocument();
    expect(screen.queryByTestId('timeseries-revenue')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /manage_store/i })).toHaveAttribute('href', '/vendor/settings');
  });

  it('renders the error state with retry', () => {
    const refetch = vi.fn();
    (useVendorDashboard as Mock).mockReturnValue({ data: undefined, isLoading: false, isError: true, error: new Error('x'), refetch });
    render(<VendorPage />);
    expect(screen.getByTestId('error-state')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Yenidən cəhd/i }));
    expect(refetch).toHaveBeenCalled();
  });

  it('changing the period refetches for that many days', () => {
    render(<VendorPage />);
    expect(useVendorDashboard).toHaveBeenLastCalledWith(30);
    fireEvent.click(screen.getByRole('tab', { name: 'vendor.period_7d' }));
    expect(useVendorDashboard).toHaveBeenLastCalledWith(7);
  });
});
