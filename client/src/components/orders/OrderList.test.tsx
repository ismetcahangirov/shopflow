import React from 'react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { OrderList } from './OrderList';
import { useMyOrders } from '@/hooks/useOrders';

// next-intl: return "<namespace>.<key>" so assertions are deterministic
vi.mock('next-intl', () => ({
  useTranslations: (namespace?: string) => (key: string) => (namespace ? `${namespace}.${key}` : key),
  useLocale: () => 'az',
}));

vi.mock('@/hooks/useOrders', () => ({
  useMyOrders: vi.fn(),
}));

// Pagination mock exposes current/total and prev/next controls
interface MockPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}
vi.mock('@/components/ui/pagination', () => ({
  Pagination: ({ currentPage, totalPages, onPageChange }: MockPaginationProps) => (
    <div data-testid="mock-pagination">
      <span data-testid="page-indicator">{currentPage}/{totalPages}</span>
      <button data-testid="prev-page" onClick={() => onPageChange(currentPage - 1)}>Prev</button>
      <button data-testid="next-page" onClick={() => onPageChange(currentPage + 1)}>Next</button>
    </div>
  ),
}));

const mockOrders = [
  {
    id: 'order-1',
    orderNumber: 'ORD-1001',
    status: 'PENDING',
    paymentStatus: 'UNPAID',
    total: 120,
    discount: 0,
    itemCount: 2,
    createdAt: '2026-06-08T10:00:00Z',
  },
  {
    id: 'order-2',
    orderNumber: 'ORD-1002',
    status: 'DELIVERED',
    paymentStatus: 'PAID',
    total: 250,
    discount: 0,
    itemCount: 1,
    createdAt: '2026-06-09T10:00:00Z',
  },
];

function mockUseMyOrders(overrides: Partial<ReturnType<typeof useMyOrders>> = {}) {
  (useMyOrders as unknown as Mock).mockReturnValue({
    data: { success: true, data: mockOrders, pagination: { total: 25, pages: 3, page: 1, limit: 10 } },
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    ...overrides,
  });
}

/** Args of the most recent useMyOrders(page, limit, status) call. */
function lastCallArgs() {
  return (useMyOrders as unknown as Mock).mock.calls.at(-1);
}

describe('OrderList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMyOrders();
  });

  it('renders the signed-in user orders and pagination', () => {
    render(<OrderList />);
    expect(screen.getByText('#ORD-1001')).toBeInTheDocument();
    expect(screen.getByText('#ORD-1002')).toBeInTheDocument();
    expect(screen.getByTestId('page-indicator')).toHaveTextContent('1/3');
  });

  it('requests page 1 with no status filter on first render', () => {
    render(<OrderList />);
    expect(lastCallArgs()).toEqual([1, 10, undefined]);
  });

  it('passes the selected status to useMyOrders when a filter tab is clicked', () => {
    render(<OrderList />);
    // Filter tab label comes through as "orders.status_shipped" via the mocked translator
    fireEvent.click(screen.getByRole('tab', { name: 'orders.status_shipped' }));
    expect(lastCallArgs()).toEqual([1, 10, 'SHIPPED']);
  });

  it('advances the page when pagination changes', () => {
    render(<OrderList />);
    fireEvent.click(screen.getByTestId('next-page'));
    expect(lastCallArgs()).toEqual([2, 10, undefined]);
  });

  it('resets to page 1 when the status filter changes', () => {
    render(<OrderList />);
    fireEvent.click(screen.getByTestId('next-page')); // → page 2
    expect(lastCallArgs()).toEqual([2, 10, undefined]);

    fireEvent.click(screen.getByRole('tab', { name: 'orders.status_processing' }));
    expect(lastCallArgs()).toEqual([1, 10, 'PROCESSING']);
  });

  it('renders the empty state when there are no orders', () => {
    mockUseMyOrders({ data: { success: true, data: [], pagination: { total: 0, pages: 0, page: 1, limit: 10 } } });
    render(<OrderList />);
    expect(screen.getByText('orders.no_orders')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-pagination')).not.toBeInTheDocument();
  });

  it('renders the error state with a retry action', () => {
    const refetch = vi.fn();
    mockUseMyOrders({ data: undefined, isError: true, error: new Error('boom'), refetch });
    render(<OrderList />);
    expect(screen.getByTestId('error-state')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Yenidən cəhd et/i }));
    expect(refetch).toHaveBeenCalled();
  });
});
