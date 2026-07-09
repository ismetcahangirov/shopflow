import React from 'react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import AdminOrdersPage from './page';
import { useOrders, useOrder, useUpdateOrderStatus } from '@/hooks/useOrders';

vi.mock('next-intl', () => ({
  useTranslations: (namespace?: string) => (key: string) =>
    namespace ? `${namespace}.${key}` : key,
  useLocale: () => 'az',
}));

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock('@/hooks/useOrders', () => ({
  useOrders: vi.fn(),
  useOrder: vi.fn(),
  useUpdateOrderStatus: vi.fn(),
}));

vi.mock('@/components/layout/Breadcrumb', () => ({
  Breadcrumb: () => <div data-testid="mock-breadcrumb" />,
}));

vi.mock('@/components/ui/page-header', () => ({
  PageHeader: ({ title, actions }: { title: React.ReactNode; actions?: React.ReactNode }) => (
    <div data-testid="mock-page-header">
      <h1>{title}</h1>
      {actions}
    </div>
  ),
}));

/* eslint-disable @typescript-eslint/no-explicit-any */
vi.mock('@/components/admin/data-table', () => ({
  DataTableColumnHeader: () => null,
  DataTableFilterSelect: ({ value, onValueChange, options, ariaLabel }: any) => (
    <select
      aria-label={ariaLabel}
      data-testid={`filter-${ariaLabel}`}
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
    >
      {options.map((o: any) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  ),
  DataTable: ({
    data,
    columns,
    isLoading,
    isError,
    emptyTitle,
    errorTitle,
    searchValue,
    onSearchChange,
    searchPlaceholder,
    filters,
  }: any) => {
    if (isLoading) return <div data-testid="dt-loading" />;
    return (
      <div>
        {onSearchChange && (
          <input
            data-testid="dt-search"
            placeholder={searchPlaceholder}
            value={searchValue ?? ''}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        )}
        {filters}
        <div style={{ display: 'none' }} aria-hidden>
          {columns.map((col: any, ci: number) => (
            <span key={`h-${ci}`}>
              {col.header ? col.header({ column: {}, header: {}, table: {} }) : null}
            </span>
          ))}
        </div>
        {isError ? (
          <div data-testid="dt-error">{errorTitle}</div>
        ) : data.length === 0 ? (
          <div data-testid="dt-empty">{emptyTitle}</div>
        ) : (
          <table>
            <tbody>
              {data.map((item: any, index: number) => (
                <tr key={item.id ?? index}>
                  {columns.map((col: any, ci: number) => (
                    <td key={ci}>
                      {col.cell
                        ? col.cell({ row: { original: item, index, getValue: (k: string) => item[k] } })
                        : null}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  },
}));

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ open, children }: any) => (open ? <div data-testid="detail-dialog">{children}</div> : null),
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({ value, onValueChange, children }: any) => (
    <select data-testid="status-select" value={value ?? ''} onChange={(e) => onValueChange(e.target.value)}>
      {children}
    </select>
  ),
  SelectTrigger: () => null,
  SelectValue: () => null,
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ value, children }: any) => <option value={value}>{children}</option>,
}));
/* eslint-enable @typescript-eslint/no-explicit-any */

describe('AdminOrdersPage', () => {
  const mockOrders = [
    {
      id: 'order-1',
      orderNumber: 'ORD-20261001',
      createdAt: '2026-06-08T10:00:00Z',
      total: 155.0,
      status: 'PENDING',
      paymentStatus: 'UNPAID',
      user: { id: 'user-1', name: 'John Doe', email: 'john@example.com' },
    },
    {
      id: 'order-2',
      orderNumber: 'ORD-20261002',
      createdAt: '2026-06-08T11:00:00Z',
      total: 250.0,
      status: 'DELIVERED',
      paymentStatus: 'PAID',
      user: { id: 'user-2', name: 'Jane Smith', email: 'jane@example.com' },
    },
  ];

  const mockDetailOrder = {
    id: 'order-1',
    orderNumber: 'ORD-20261001',
    status: 'PENDING',
    paymentStatus: 'UNPAID',
    paymentMethod: 'stripe',
    trackingNumber: null,
    subtotal: 150.0,
    shippingCost: 5.0,
    discount: 0.0,
    total: 155.0,
    notes: 'Please leave at reception',
    createdAt: '2026-06-08T10:00:00Z',
    user: { id: 'user-1', name: 'John Doe', email: 'john@example.com' },
    address: {
      fullName: 'John Doe',
      phone: '+994501112233',
      city: 'Bakı',
      district: 'Nəsimi',
      street: 'Nizami 10',
      building: 'A',
      apartment: '15',
    },
    items: [
      {
        id: 'item-1',
        productName: 'Cool Phone',
        productSku: 'SKU-PHONE',
        quantity: 1,
        price: 150.0,
        total: 150.0,
        product: { id: 'p-1', name: 'Cool Phone', slug: 'cool-phone', image: null },
      },
    ],
    statusHistory: [{ status: 'PENDING', note: 'Sifariş yaradıldı', createdAt: '2026-06-08T10:00:00Z' }],
  };

  const mockMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockMutateAsync.mockResolvedValue(undefined);
    (useOrders as Mock).mockReturnValue({
      data: { data: mockOrders, pagination: { total: 2, pages: 1, page: 1, limit: 10 } },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    (useOrder as Mock).mockReturnValue({ data: null, isLoading: false });
    (useUpdateOrderStatus as Mock).mockReturnValue({ mutateAsync: mockMutateAsync, isPending: false });
  });

  it('renders loading state', () => {
    (useOrders as Mock).mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    });
    render(<AdminOrdersPage />);
    expect(screen.getByTestId('dt-loading')).toBeInTheDocument();
  });

  it('renders empty state', () => {
    (useOrders as Mock).mockReturnValue({
      data: { data: [], pagination: { total: 0, pages: 0, page: 1, limit: 10 } },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    render(<AdminOrdersPage />);
    expect(screen.getByText('admin_orders.no_orders')).toBeInTheDocument();
  });

  it('renders orders list', () => {
    render(<AdminOrdersPage />);
    expect(screen.getByText('ORD-20261001')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('ORD-20261002')).toBeInTheDocument();
  });

  it('search refetches with the search term', () => {
    render(<AdminOrdersPage />);
    fireEvent.change(screen.getByTestId('dt-search'), { target: { value: 'ORD-20261001' } });
    expect(useOrders).toHaveBeenLastCalledWith(
      expect.objectContaining({ search: 'ORD-20261001', page: 1 }),
    );
  });

  it('opening a row shows the detail dialog', () => {
    (useOrder as Mock).mockReturnValue({ data: mockDetailOrder, isLoading: false });
    render(<AdminOrdersPage />);
    fireEvent.click(screen.getAllByRole('button', { name: /admin_orders\.view_details/i })[0]);
    expect(screen.getByTestId('detail-dialog')).toBeInTheDocument();
    expect(screen.getByText('Cool Phone')).toBeInTheDocument();
    expect(screen.getByText('Please leave at reception')).toBeInTheDocument();
  });

  it('renders detail branches for discount, tracking number and non-stripe payment', () => {
    (useOrder as Mock).mockReturnValue({
      data: {
        ...mockDetailOrder,
        paymentMethod: 'cash',
        trackingNumber: 'TRK-9',
        discount: 15.0,
        paymentStatus: 'PARTIALLY_REFUNDED',
        status: 'SHIPPED',
      },
      isLoading: false,
    });
    render(<AdminOrdersPage />);
    fireEvent.click(screen.getAllByRole('button', { name: /admin_orders\.view_details/i })[0]);
    expect(screen.getByTestId('detail-dialog')).toBeInTheDocument();
    // tracking number is shown in the summary when present
    expect(screen.getByText('TRK-9')).toBeInTheDocument();
  });

  it('submitting the status form calls the mutation', async () => {
    (useOrder as Mock).mockReturnValue({ data: mockDetailOrder, isLoading: false });
    render(<AdminOrdersPage />);
    fireEvent.click(screen.getAllByRole('button', { name: /admin_orders\.view_details/i })[0]);

    fireEvent.change(screen.getByTestId('status-select'), { target: { value: 'PROCESSING' } });
    fireEvent.change(screen.getByLabelText('admin_orders.note'), {
      target: { value: 'Processing the packaging' },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /admin_orders\.update_status/i }));
    });

    expect(mockMutateAsync).toHaveBeenCalledWith({
      id: 'order-1',
      status: 'PROCESSING',
      trackingNumber: undefined,
      note: 'Processing the packaging',
    });
  });

  it('shows the tracking input when status is SHIPPED', async () => {
    (useOrder as Mock).mockReturnValue({ data: mockDetailOrder, isLoading: false });
    render(<AdminOrdersPage />);
    fireEvent.click(screen.getAllByRole('button', { name: /admin_orders\.view_details/i })[0]);

    fireEvent.change(screen.getByTestId('status-select'), { target: { value: 'SHIPPED' } });
    const trackingInput = screen.getByLabelText('admin_orders.tracking_number');
    expect(trackingInput).toBeInTheDocument();
    fireEvent.change(trackingInput, { target: { value: 'TRACK-123' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /admin_orders\.update_status/i }));
    });

    expect(mockMutateAsync).toHaveBeenCalledWith({
      id: 'order-1',
      status: 'SHIPPED',
      trackingNumber: 'TRACK-123',
      note: undefined,
    });
  });
});
