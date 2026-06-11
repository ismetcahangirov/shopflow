import React from 'react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import AdminReviewsPage from './page';
import { useAdminReviews, useApproveReview, useDeleteReview } from '@/hooks/useReviews';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: (namespace?: string) => (key: string) => {
    return namespace ? `${namespace}.${key}` : key;
  },
}));

// Mock hooks
vi.mock('@/hooks/useReviews', () => ({
  useAdminReviews: vi.fn(),
  useApproveReview: vi.fn(),
  useDeleteReview: vi.fn(),
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

interface MockConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

vi.mock('@/components/ui/confirm-dialog', () => ({
  ConfirmDialog: ({ isOpen, onClose, onConfirm, title, message }: MockConfirmDialogProps) => {
    if (!isOpen) return null;
    return (
      <div data-testid="mock-confirm-dialog">
        <h2>{title}</h2>
        <p>{message}</p>
        <button onClick={onConfirm} data-testid="confirm-btn">Confirm</button>
        <button onClick={onClose} data-testid="cancel-btn">Cancel</button>
      </div>
    );
  },
}));

interface MockStarRatingProps {
  rating: number;
}

vi.mock('@/components/products/StarRating', () => ({
  StarRating: ({ rating }: MockStarRatingProps) => (
    <div data-testid="mock-star-rating" data-rating={rating}>
      Rating: {rating}
    </div>
  ),
}));

describe('AdminReviewsPage component tests', () => {
  const mockReviews = [
    {
      id: 'review-1',
      rating: 4,
      title: 'Very Good',
      body: 'Excellent product quality',
      isApproved: false,
      isVerified: true,
      helpfulCount: 0,
      userId: 'user-1',
      productId: 'prod-1',
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
      isVerified: false,
      helpfulCount: 2,
      userId: 'user-2',
      productId: 'prod-2',
      createdAt: '2026-06-08T11:00:00Z',
      user: { id: 'user-2', name: 'Jane Smith' },
      product: { id: 'prod-2', name: 'Wireless Charger', slug: 'wireless-charger' },
    },
  ];

  const mockApproveMutateAsync = vi.fn();
  const mockDeleteMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (useAdminReviews as Mock).mockReturnValue({
      data: {
        data: mockReviews,
        pagination: { total: 2, pages: 1, page: 1, limit: 10 },
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    (useApproveReview as Mock).mockReturnValue({
      mutateAsync: mockApproveMutateAsync,
      isPending: false,
    });

    (useDeleteReview as Mock).mockReturnValue({
      mutateAsync: mockDeleteMutateAsync,
      isPending: false,
    });
  });

  it('renders loading skeleton when isLoading is true', () => {
    (useAdminReviews as Mock).mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    });

    render(<AdminReviewsPage />);
    expect(screen.getByTestId('mock-page-header')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('renders empty state when no reviews found', () => {
    (useAdminReviews as Mock).mockReturnValue({
      data: {
        data: [],
        pagination: { total: 0, pages: 0, page: 1, limit: 10 },
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<AdminReviewsPage />);
    expect(screen.getByText('admin_reviews.no_reviews')).toBeInTheDocument();
  });

  it('renders reviews table listing when reviews data is loaded', () => {
    render(<AdminReviewsPage />);

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Premium iPhone Case')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Very Good')).toBeInTheDocument();
    expect(screen.getByText('Excellent product quality')).toBeInTheDocument();

    expect(screen.getByText('Wireless Charger')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Amazing')).toBeInTheDocument();
    expect(screen.getByText('I really love this case!')).toBeInTheDocument();
  });

  it('handles filtering updates', () => {
    const mockRefetch = vi.fn();
    (useAdminReviews as Mock).mockReturnValue({
      data: { data: mockReviews, pagination: { total: 2, pages: 1, page: 1, limit: 10 } },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    });

    render(<AdminReviewsPage />);

    // Click Pending filter button
    const pendingButton = screen.getByRole('button', { name: 'admin_reviews.pending' });
    fireEvent.click(pendingButton);

    expect(useAdminReviews).toHaveBeenLastCalledWith(
      expect.objectContaining({
        isApproved: false,
        page: 1,
      })
    );
  });

  it('triggers update approval status mutation when toggle approve/reject is clicked', async () => {
    render(<AdminReviewsPage />);

    // Find all rows, get buttons inside them
    const rows = screen.getAllByRole('row');
    // Row 1 is header, Row 2 is review-1 (pending, isApproved: false), Row 3 is review-2 (approved, isApproved: true)
    
    // Toggle review-1 to approved (isApproved: true)
    const review1ApproveBtn = within(rows[1]).getAllByRole('button')[0];
    fireEvent.click(review1ApproveBtn);

    expect(mockApproveMutateAsync).toHaveBeenCalledWith({
      id: 'review-1',
      isApproved: true,
    });
  });

  it('opens confirm dialog and deletes review upon confirmation', async () => {
    render(<AdminReviewsPage />);

    const rows = screen.getAllByRole('row');
    const review1DeleteBtn = within(rows[1]).getAllByRole('button')[1];
    
    // Click delete button to open confirm dialog
    fireEvent.click(review1DeleteBtn);

    expect(screen.getByTestId('mock-confirm-dialog')).toBeInTheDocument();
    expect(screen.getByText('admin_reviews.delete')).toBeInTheDocument();

    const confirmBtn = screen.getByTestId('confirm-btn');
    fireEvent.click(confirmBtn);

    expect(mockDeleteMutateAsync).toHaveBeenCalledWith('review-1');
  });
});
