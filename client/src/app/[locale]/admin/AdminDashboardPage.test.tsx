import React from 'react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminPage from './page';
import { useDashboard } from '@/hooks/useAnalytics';

// next-intl: return `namespace.key` so we can assert which key rendered.
vi.mock('next-intl', () => ({
  useTranslations: (namespace?: string) => (key: string) =>
    namespace ? `${namespace}.${key}` : key,
}));

vi.mock('@/hooks/useAnalytics', () => ({
  useDashboard: vi.fn(),
}));

// Recharts wrappers are stubbed — jsdom has no layout for SVG charts.
/* eslint-disable @typescript-eslint/no-explicit-any */
vi.mock('@/components/admin/charts/TimeSeriesChart', () => ({
  TimeSeriesChart: ({ yKey, data }: any) => (
    <div data-testid={`timeseries-${yKey}`}>points:{data.length}</div>
  ),
}));
vi.mock('@/components/admin/charts/StatusDonut', () => ({
  StatusDonut: ({ data }: any) => <div data-testid="status-donut">slices:{data.length}</div>,
}));
/* eslint-enable @typescript-eslint/no-explicit-any */

const mockData = {
  summary: {
    totalRevenue: 1234.5,
    totalOrders: 42,
    totalCustomers: 15,
    totalProducts: 30,
    avgOrderValue: 29.39,
  },
  revenueChart: [
    { date: '2026-06-01T00:00:00.000Z', revenue: 100, orders: 3 },
    { date: '2026-06-02T00:00:00.000Z', revenue: 200, orders: 5 },
  ],
  topProducts: [{ id: 'p1', name: 'iPhone Case', salesCount: 12, revenue: 240 }],
  ordersByStatus: { PENDING: 2, DELIVERED: 8, CANCELLED: 0 },
  recentOrders: [
    {
      id: 'o1',
      orderNumber: 'ORD-1001',
      total: 59.99,
      status: 'DELIVERED',
      createdAt: '2026-06-02T00:00:00.000Z',
      user: { name: 'John Doe' },
    },
  ],
};

describe('AdminPage (dashboard)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useDashboard as Mock).mockReturnValue({
      data: mockData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  it('renders loading skeletons while fetching', () => {
    (useDashboard as Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
    render(<AdminPage />);
    // Stat values are absent during load.
    expect(screen.queryByText('1,234.50 AZN')).not.toBeInTheDocument();
    // Chart panels render their skeletons, not the stubbed charts.
    expect(screen.queryByTestId('timeseries-revenue')).not.toBeInTheDocument();
  });

  it('renders the error state with a retry handler', () => {
    const refetch = vi.fn();
    (useDashboard as Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('nope'),
      refetch,
    });
    render(<AdminPage />);
    expect(screen.getByTestId('error-state')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Yenidən cəhd/i }));
    expect(refetch).toHaveBeenCalled();
  });

  it('renders stat cards, charts, top products and recent orders', () => {
    render(<AdminPage />);
    // Stat values (currency formatting)
    expect(screen.getByText('1,234.50 AZN')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('29.39 AZN')).toBeInTheDocument();
    // Charts
    expect(screen.getByTestId('timeseries-revenue')).toHaveTextContent('points:2');
    // Zero-count statuses are filtered out of the donut (PENDING + DELIVERED only)
    expect(screen.getByTestId('status-donut')).toHaveTextContent('slices:2');
    // Top products + recent orders
    expect(screen.getByText('iPhone Case')).toBeInTheDocument();
    expect(screen.getByText('ORD-1001')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('59.99 AZN')).toBeInTheDocument();
    // "View all" links to the orders page
    expect(screen.getByRole('link', { name: /view_all/i })).toHaveAttribute(
      'href',
      '/admin/orders',
    );
  });

  it('changing the period refetches the dashboard for that many days', () => {
    render(<AdminPage />);
    expect(useDashboard).toHaveBeenLastCalledWith(30);
    fireEvent.click(screen.getByRole('tab', { name: 'admin_dashboard.period_7d' }));
    expect(useDashboard).toHaveBeenLastCalledWith(7);
  });
});
