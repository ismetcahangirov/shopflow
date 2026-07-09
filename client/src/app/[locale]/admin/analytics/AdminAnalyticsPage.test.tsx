import React from 'react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminAnalyticsPage from './page';
import { useSalesChart } from '@/hooks/useAnalytics';

vi.mock('next-intl', () => ({
  useTranslations: (namespace?: string) => (key: string) =>
    namespace ? `${namespace}.${key}` : key,
}));

vi.mock('@/hooks/useAnalytics', () => ({
  useSalesChart: vi.fn(),
}));

/* eslint-disable @typescript-eslint/no-explicit-any */
vi.mock('@/components/admin/charts/TimeSeriesChart', () => ({
  TimeSeriesChart: ({ yKey, data }: any) => (
    <div data-testid={`timeseries-${yKey}`}>points:{data.length}</div>
  ),
}));

// Native <select> stand-in so granularity changes are easy to drive in jsdom.
vi.mock('@/components/ui/select', () => ({
  Select: ({ value, onValueChange, children }: any) => (
    <select
      data-testid="granularity"
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
    >
      {children}
    </select>
  ),
  SelectTrigger: () => null,
  SelectValue: () => null,
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ value, children }: any) => <option value={value}>{children}</option>,
}));
/* eslint-enable @typescript-eslint/no-explicit-any */

const points = [
  { period: '2026-06-01T00:00:00.000Z', revenue: 50, orders: 2 },
  { period: '2026-06-02T00:00:00.000Z', revenue: 70, orders: 3 },
];

describe('AdminAnalyticsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useSalesChart as Mock).mockReturnValue({
      data: points,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  it('renders loading skeletons while fetching', () => {
    (useSalesChart as Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
    render(<AdminAnalyticsPage />);
    expect(screen.queryByTestId('timeseries-revenue')).not.toBeInTheDocument();
  });

  it('renders the error state with a retry handler', () => {
    const refetch = vi.fn();
    (useSalesChart as Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('nope'),
      refetch,
    });
    render(<AdminAnalyticsPage />);
    expect(screen.getByTestId('error-state')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Yenidən cəhd/i }));
    expect(refetch).toHaveBeenCalled();
  });

  it('computes summary totals and renders both time-series charts', () => {
    render(<AdminAnalyticsPage />);
    // totalRevenue = 120, totalOrders = 5, avg = 24
    expect(screen.getByText('120.00 AZN')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('24.00 AZN')).toBeInTheDocument();
    expect(screen.getByTestId('timeseries-revenue')).toHaveTextContent('points:2');
    expect(screen.getByTestId('timeseries-orders')).toHaveTextContent('points:2');
  });

  it('shows empty states when the range has no data', () => {
    (useSalesChart as Mock).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
    render(<AdminAnalyticsPage />);
    expect(screen.getAllByTestId('chart-card-empty')).toHaveLength(2);
  });

  it('refetches when the granularity changes', () => {
    render(<AdminAnalyticsPage />);
    fireEvent.change(screen.getByTestId('granularity'), { target: { value: 'month' } });
    expect(useSalesChart).toHaveBeenLastCalledWith(
      expect.objectContaining({ groupBy: 'month' }),
    );
  });

  it('refetches when the start date changes', () => {
    render(<AdminAnalyticsPage />);
    fireEvent.change(screen.getByLabelText('admin_analytics.start_date'), {
      target: { value: '2026-01-01' },
    });
    expect(useSalesChart).toHaveBeenLastCalledWith(
      expect.objectContaining({ startDate: '2026-01-01' }),
    );
  });
});
