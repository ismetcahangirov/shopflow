import React from 'react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminOrdersPage from './page';
import { useOrders, useOrder, useUpdateOrderStatus } from '@/hooks/useOrders';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: (namespace?: string) => (key: string) => {
    return namespace ? `${namespace}.${key}` : key;
  },
  useLocale: () => 'az',
}));

// Mock hooks
vi.mock('@/hooks/useOrders', () => ({
  useOrders: vi.fn(),
  useOrder: vi.fn(),
  useUpdateOrderStatus: vi.fn(),
}));

// Mock UI components to simplify test rendering and prevent portal errors
vi.mock('@/components/layout/Breadcrumb', () => ({
  Breadcrumb: () => <div data-testid="mock-breadcrumb" />,
}));

interface MockPageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}

vi.mock('@/components/ui/page-header', () => ({
  PageHeader: ({ title, description, actions }: MockPageHeaderProps) => (
    <div data-testid="mock-page-header">
      <h1>{title}</h1>
      {description && <p>{description}</p>}
      {actions}
    </div>
  ),
}));

interface MockModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

vi.mock('@/components/ui/modal', () => ({
  Modal: ({ children, isOpen, onClose, title }: MockModalProps) => {
    if (!isOpen) return null;
    return (
      <div data-testid="mock-modal">
        <h2>{title}</h2>
        <button onClick={onClose} data-testid="modal-close-btn">Close</button>
        {children}
      </div>
    );
  },
}));

interface MockSearchBarProps {
  onSearch: (val: string) => void;
  placeholder?: string;
}

vi.mock('@/components/ui/search-bar', () => ({
  SearchBar: ({ onSearch, placeholder }: MockSearchBarProps) => (
    <input
      data-testid="mock-search-bar"
      placeholder={placeholder}
      onChange={(e) => onSearch(e.target.value)}
    />
  ),
}));

interface MockPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

vi.mock('@/components/ui/pagination', () => ({
  Pagination: ({ currentPage, totalPages, onPageChange }: MockPaginationProps) => (
    <div data-testid="mock-pagination">
      <span>{currentPage}/{totalPages}</span>
      <button onClick={() => onPageChange(currentPage - 1)} data-testid="prev-page">Prev</button>
      <button onClick={() => onPageChange(currentPage + 1)} data-testid="next-page">Next</button>
    </div>
  ),
}));

describe('AdminOrdersPage component tests', () => {
  const mockOrders = [
    {
      id: 'order-1',
      orderNumber: 'ORD-20261001',
      createdAt: '2026-06-08T10:00:00Z',
      total: 155.0,
      discount: 0.0,
      subtotal: 150.0,
      shippingCost: 5.0,
      tax: 0.0,
      status: 'PENDING',
      paymentStatus: 'UNPAID',
      itemCount: 2,
      user: { id: 'user-1', name: 'John Doe', email: 'john@example.com' },
    },
    {
      id: 'order-2',
      orderNumber: 'ORD-20261002',
      createdAt: '2026-06-08T11:00:00Z',
      total: 250.0,
      discount: 10.0,
      subtotal: 260.0,
      shippingCost: 0.0,
      tax: 0.0,
      status: 'DELIVERED',
      paymentStatus: 'PAID',
      itemCount: 1,
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
    tax: 0.0,
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
    statusHistory: [
      { status: 'PENDING', note: 'Sifariş yaradıldı', createdAt: '2026-06-08T10:00:00Z' },
    ],
  };

  const mockMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useOrders as Mock).mockReturnValue({
      data: {
        data: mockOrders,
        pagination: { total: 2, pages: 1, page: 1, limit: 10 },
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    (useOrder as Mock).mockReturnValue({
      data: null,
      isLoading: false,
    });

    (useUpdateOrderStatus as Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });
  });

  it('renders loading skeleton when isLoading is true', () => {
    (useOrders as Mock).mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    });

    render(<AdminOrdersPage />);
    expect(screen.getByTestId('mock-page-header')).toBeInTheDocument();
    // It should render skeletons, wait, let's verify if there is no table when loading
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('renders empty state when no orders match criteria', () => {
    (useOrders as Mock).mockReturnValue({
      data: {
        data: [],
        pagination: { total: 0, pages: 0, page: 1, limit: 10 },
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<AdminOrdersPage />);
    expect(screen.getByText('admin_orders.no_orders')).toBeInTheDocument();
  });

  it('renders orders table listing when orders data is loaded', () => {
    render(<AdminOrdersPage />);

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('ORD-20261001')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('ORD-20261002')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('handles search and filtering updates', () => {
    const mockRefetch = vi.fn();
    (useOrders as Mock).mockReturnValue({
      data: { data: mockOrders, pagination: { total: 2, pages: 1, page: 1, limit: 10 } },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    });

    render(<AdminOrdersPage />);

    // Trigger Search
    const searchBar = screen.getByTestId('mock-search-bar');
    fireEvent.change(searchBar, { target: { value: 'ORD-20261001' } });

    // Verify useOrders hook query parameters are modified on next renders or query triggers
    expect(useOrders).toHaveBeenLastCalledWith(
      expect.objectContaining({
        search: 'ORD-20261001',
        page: 1,
      })
    );
  });

  it('opens details modal upon clicking view details button, fetches detail and shows it', async () => {
    // Open details modal triggers query with selected ID
    const { rerender } = render(<AdminOrdersPage />);

    const viewDetailsButtons = screen.getAllByRole('button', { name: /admin_orders\.view_details/i });
    fireEvent.click(viewDetailsButtons[0]);

    // Rerender with mockOrder query loaded
    (useOrder as Mock).mockReturnValue({
      data: mockDetailOrder,
      isLoading: false,
    });

    rerender(<AdminOrdersPage />);

    expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
    expect(screen.getByText('admin_orders.details_title — #ORD-20261001')).toBeInTheDocument();
    expect(screen.getByText('Cool Phone')).toBeInTheDocument();
    expect(screen.getByText('Please leave at reception')).toBeInTheDocument();
  });

  it('triggers update status mutation successfully', async () => {
    (useOrder as Mock).mockReturnValue({
      data: mockDetailOrder,
      isLoading: false,
    });

    const { rerender } = render(<AdminOrdersPage />);

    // Open Modal
    const viewDetailsButtons = screen.getAllByRole('button', { name: /admin_orders\.view_details/i });
    fireEvent.click(viewDetailsButtons[0]);
    rerender(<AdminOrdersPage />);

    // Locate Update Status form elements
    const statusSelect = screen.getByRole('combobox', { name: /^admin_orders\.status$/ });
    fireEvent.change(statusSelect, { target: { value: 'PROCESSING' } });

    const noteTextarea = screen.getByRole('textbox', { name: /admin_orders\.note/i });
    fireEvent.change(noteTextarea, { target: { value: 'Processing the packaging' } });

    const submitBtn = screen.getByRole('button', { name: /admin_orders\.update_status/i });
    fireEvent.click(submitBtn);

    expect(mockMutateAsync).toHaveBeenCalledWith({
      id: 'order-1',
      status: 'PROCESSING',
      trackingNumber: undefined,
      note: 'Processing the packaging',
    });
  });

  it('renders tracking number input when status is changed to SHIPPED', async () => {
    (useOrder as Mock).mockReturnValue({
      data: mockDetailOrder,
      isLoading: false,
    });

    const { rerender } = render(<AdminOrdersPage />);

    // Open Modal
    const viewDetailsButtons = screen.getAllByRole('button', { name: /admin_orders\.view_details/i });
    fireEvent.click(viewDetailsButtons[0]);
    rerender(<AdminOrdersPage />);

    // Change status to SHIPPED
    const statusSelect = screen.getByRole('combobox', { name: /^admin_orders\.status$/ });
    fireEvent.change(statusSelect, { target: { value: 'SHIPPED' } });

    // Tracking input should now be visible
    const trackingInput = screen.getByLabelText(/admin_orders\.tracking_number/i);
    expect(trackingInput).toBeInTheDocument();
    fireEvent.change(trackingInput, { target: { value: 'TRACK-123' } });

    const submitBtn = screen.getByRole('button', { name: /admin_orders\.update_status/i });
    fireEvent.click(submitBtn);

    expect(mockMutateAsync).toHaveBeenCalledWith({
      id: 'order-1',
      status: 'SHIPPED',
      trackingNumber: 'TRACK-123',
      note: undefined,
    });
  });
});
