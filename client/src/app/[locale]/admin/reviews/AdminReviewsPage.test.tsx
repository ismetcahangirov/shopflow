import React from 'react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, fireEvent, within, act } from '@testing-library/react';
import AdminReviewsPage from './page';
import { useAdminReviews, useApproveReview, useDeleteReview } from '@/hooks/useReviews';

// next-intl: return `namespace.key`
vi.mock('next-intl', () => ({
  useTranslations: (namespace?: string) => (key: string) =>
    namespace ? `${namespace}.${key}` : key,
}));

// Sonner toasts are side-effect only in tests
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock('@/hooks/useReviews', () => ({
  useAdminReviews: vi.fn(),
  useApproveReview: vi.fn(),
  useDeleteReview: vi.fn(),
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

vi.mock('@/components/products/StarRating', () => ({
  StarRating: ({ rating }: { rating: number }) => (
    <div data-testid="mock-star-rating">Rating: {rating}</div>
  ),
}));

// Lightweight DataTable double: renders each row's column cells so the page's
// cell/action logic is exercised without the Base UI portal machinery.
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

vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuTrigger: ({ render }: any) => render ?? null,
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuItem: ({ children, variant, inset, ...props }: any) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
  DropdownMenuSeparator: () => null,
}));

vi.mock('@/components/admin/AdminConfirmDialog', () => ({
  AdminConfirmDialog: ({ open, onConfirm, onOpenChange, title, children }: any) =>
    open ? (
      <div data-testid="confirm-dialog">
        <h2>{title}</h2>
        {children}
        <button data-testid="confirm-btn" onClick={onConfirm}>
          Confirm
        </button>
        <button data-testid="cancel-btn" onClick={() => onOpenChange(false)}>
          Cancel
        </button>
      </div>
    ) : null,
}));
/* eslint-enable @typescript-eslint/no-explicit-any */

describe('AdminReviewsPage', () => {
  const mockReviews = [
    {
      id: 'review-1',
      rating: 4,
      title: 'Very Good',
      body: 'Excellent product quality',
      isApproved: false,
      createdAt: '2026-06-08T10:00:00Z',
      user: { id: 'user-1', name: 'John Doe' },
      product: { id: 'prod-1', name: 'Premium iPhone Case', slug: 'premium-iphone-case' },
    },
    {
      id: 'review-2',
      rating: 5,
      title: 'Amazing',
      body: 'I really love this case!',
      isApproved: true,
      createdAt: '2026-06-08T11:00:00Z',
      user: { id: 'user-2', name: 'Jane Smith' },
      product: { id: 'prod-2', name: 'Wireless Charger', slug: 'wireless-charger' },
    },
  ];

  const mockApprove = vi.fn();
  const mockDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockApprove.mockResolvedValue(undefined);
    mockDelete.mockResolvedValue(undefined);

    (useAdminReviews as Mock).mockReturnValue({
      data: { data: mockReviews, pagination: { total: 2, pages: 1, page: 1, limit: 10 } },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    (useApproveReview as Mock).mockReturnValue({ mutateAsync: mockApprove, isPending: false });
    (useDeleteReview as Mock).mockReturnValue({ mutateAsync: mockDelete, isPending: false });
  });

  it('renders loading state', () => {
    (useAdminReviews as Mock).mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    });
    render(<AdminReviewsPage />);
    expect(screen.getByTestId('dt-loading')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('renders empty state when no reviews', () => {
    (useAdminReviews as Mock).mockReturnValue({
      data: { data: [], pagination: { total: 0, pages: 0, page: 1, limit: 10 } },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    render(<AdminReviewsPage />);
    expect(screen.getByText('admin_reviews.no_reviews')).toBeInTheDocument();
  });

  it('renders reviews list', () => {
    render(<AdminReviewsPage />);
    expect(screen.getByText('Premium iPhone Case')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Very Good')).toBeInTheDocument();
    expect(screen.getByText('Excellent product quality')).toBeInTheDocument();
    expect(screen.getByText('Wireless Charger')).toBeInTheDocument();
  });

  it('changing the status filter refetches with isApproved=false', () => {
    render(<AdminReviewsPage />);
    fireEvent.change(screen.getByTestId('filter-admin_reviews.status_filter'), {
      target: { value: 'false' },
    });
    expect(useAdminReviews).toHaveBeenLastCalledWith(
      expect.objectContaining({ isApproved: false, page: 1 }),
    );
  });

  it('toggling approval calls the approve mutation', async () => {
    render(<AdminReviewsPage />);
    // review-1 is pending -> shows the "approve" action
    await act(async () => {
      fireEvent.click(screen.getByText('admin_reviews.approve'));
    });
    expect(mockApprove).toHaveBeenCalledWith({ id: 'review-1', isApproved: true });
  });

  it('deleting a review opens the confirm dialog and deletes on confirm', async () => {
    render(<AdminReviewsPage />);
    const rows = screen.getAllByRole('row');
    fireEvent.click(within(rows[0]).getByText('admin_reviews.delete'));
    expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(screen.getByTestId('confirm-btn'));
    });
    expect(mockDelete).toHaveBeenCalledWith('review-1');
  });
});
