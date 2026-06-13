import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';

import AdminVendorsPage from './page';
import { useAdminVendors, useUpdateVendorStatus, type AdminVendor, type VendorStatus } from '@/hooks/useVendor';
import type { ApiResponse } from '@/types';

// ─── Mocks ───────────────────────────────────────────────────────────────────

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => `admin_vendors.${key}`,
}));

vi.mock('@/components/layout/Breadcrumb', () => ({
  Breadcrumb: () => <nav data-testid="breadcrumb" />,
}));

vi.mock('@/components/ui/page-header', () => ({
  PageHeader: ({ title, actions }: { title: string; actions?: React.ReactNode }) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
      {actions}
    </div>
  ),
}));

vi.mock('@/components/ui/pagination', () => ({
  Pagination: ({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (p: number) => void }) => (
    <div data-testid="pagination">
      <button onClick={() => onPageChange(currentPage + 1)}>Next</button>
      <span>{currentPage}/{totalPages}</span>
    </div>
  ),
}));

vi.mock('@/components/ui/confirm-dialog', () => ({
  ConfirmDialog: () => null,
}));

vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({ fallback }: { fallback: string }) => (
    <div data-testid="avatar">{fallback[0]}</div>
  ),
}));

const mockRefetch = vi.fn();
const mockMutateAsync = vi.fn();

vi.mock('@/hooks/useVendor', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks/useVendor')>();
  return {
    ...actual,
    useAdminVendors: vi.fn(),
    useUpdateVendorStatus: vi.fn(),
  };
});

// ─── Test Helpers ─────────────────────────────────────────────────────────────

function buildVendor(overrides: Partial<AdminVendor> = {}): AdminVendor {
  return {
    id: 'vendor-1',
    storeName: 'Tech Store',
    slug: 'tech-store',
    description: null,
    logo: null,
    status: 'PENDING',
    commission: 5,
    totalSales: 1200.5,
    productCount: 12,
    createdAt: '2024-01-15T10:00:00Z',
    user: {
      id: 'user-1',
      name: 'Ali Mammadov',
      email: 'ali@test.az',
    },
    ...overrides,
  };
}

function buildApiResponse(vendors: AdminVendor[]): ApiResponse<AdminVendor[]> {
  return {
    success: true,
    data: vendors,
    pagination: { page: 1, limit: 10, total: vendors.length, pages: 1 },
  } as ApiResponse<AdminVendor[]>;
}

function setupHooks(
  vendors: AdminVendor[] = [],
  opts: { isLoading?: boolean; isError?: boolean } = {},
) {
  (useAdminVendors as Mock).mockReturnValue({
    data: opts.isLoading || opts.isError ? undefined : buildApiResponse(vendors),
    isLoading: opts.isLoading ?? false,
    isError: opts.isError ?? false,
    refetch: mockRefetch,
  });

  (useUpdateVendorStatus as Mock).mockReturnValue({
    mutateAsync: mockMutateAsync,
    isPending: false,
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('AdminVendorsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMutateAsync.mockResolvedValue({ id: 'vendor-1', status: 'APPROVED' as VendorStatus });
  });

  it('renders loading skeletons when isLoading is true', () => {
    setupHooks([], { isLoading: true });
    render(<AdminVendorsPage />);

    // Table should NOT be rendered
    expect(screen.queryByRole('table')).toBeNull();
    // Skeletons should be present (div with animate-pulse inside)
    expect(screen.getByTestId('page-header')).toBeInTheDocument();
  });

  it('renders empty state when vendors list is empty', () => {
    setupHooks([]);
    render(<AdminVendorsPage />);

    expect(screen.getByText('admin_vendors.no_vendors')).toBeInTheDocument();
  });

  it('renders vendor table with store name and owner info', () => {
    const vendor = buildVendor({ storeName: 'Tech Store', user: { id: 'u1', name: 'Ali', email: 'ali@test.az' } });
    setupHooks([vendor]);
    render(<AdminVendorsPage />);

    expect(screen.getByText('Tech Store')).toBeInTheDocument();
    expect(screen.getByText('Ali')).toBeInTheDocument();
    expect(screen.getByText('ali@test.az')).toBeInTheDocument();
  });

  it('renders the search input', () => {
    setupHooks([]);
    render(<AdminVendorsPage />);

    const searchInput = screen.getByTestId('search-vendors-input');
    expect(searchInput).toBeInTheDocument();
  });

  it('status filter buttons are rendered', () => {
    setupHooks([]);
    render(<AdminVendorsPage />);

    expect(screen.getByTestId('status-filter-ALL')).toBeInTheDocument();
    expect(screen.getByTestId('status-filter-PENDING')).toBeInTheDocument();
    expect(screen.getByTestId('status-filter-APPROVED')).toBeInTheDocument();
    expect(screen.getByTestId('status-filter-REJECTED')).toBeInTheDocument();
    expect(screen.getByTestId('status-filter-SUSPENDED')).toBeInTheDocument();
  });

  it('clicking status filter calls hook with updated status', () => {
    setupHooks([]);
    render(<AdminVendorsPage />);

    const pendingBtn = screen.getByTestId('status-filter-PENDING');
    fireEvent.click(pendingBtn);

    expect(useAdminVendors).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'PENDING', page: 1 }),
    );
  });

  it('PENDING vendor shows approve and reject action buttons', () => {
    const vendor = buildVendor({ status: 'PENDING' });
    setupHooks([vendor]);
    render(<AdminVendorsPage />);

    expect(screen.getByTestId('action-approved-vendor-1')).toBeInTheDocument();
    expect(screen.getByTestId('action-rejected-vendor-1')).toBeInTheDocument();
    expect(screen.queryByTestId('action-suspended-vendor-1')).toBeNull();
  });

  it('APPROVED vendor shows suspend and reject action buttons', () => {
    const vendor = buildVendor({ status: 'APPROVED' });
    setupHooks([vendor]);
    render(<AdminVendorsPage />);

    expect(screen.getByTestId('action-suspended-vendor-1')).toBeInTheDocument();
    expect(screen.getByTestId('action-rejected-vendor-1')).toBeInTheDocument();
    expect(screen.queryByTestId('action-approved-vendor-1')).toBeNull();
  });

  it('clicking action opens confirmation dialog', () => {
    const vendor = buildVendor({ status: 'PENDING' });
    setupHooks([vendor]);
    render(<AdminVendorsPage />);

    const approveBtn = screen.getByTestId('action-approved-vendor-1');
    fireEvent.click(approveBtn);

    expect(screen.getByTestId('status-confirm-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('vendor-status-note')).toBeInTheDocument();
  });

  it('confirm button calls mutateAsync with correct payload', async () => {
    const vendor = buildVendor({ status: 'PENDING' });
    setupHooks([vendor]);
    render(<AdminVendorsPage />);

    // Open confirm dialog
    fireEvent.click(screen.getByTestId('action-approved-vendor-1'));

    // Enter note
    const noteInput = screen.getByTestId('vendor-status-note');
    fireEvent.change(noteInput, { target: { value: 'Looks good' } });

    // Confirm
    const confirmBtn = screen.getByTestId('confirm-btn');
    await act(async () => {
      fireEvent.click(confirmBtn);
    });

    expect(mockMutateAsync).toHaveBeenCalledWith({
      id: 'vendor-1',
      status: 'APPROVED',
      note: 'Looks good',
    });
  });

  it('cancel button closes confirmation dialog without calling mutateAsync', async () => {
    const vendor = buildVendor({ status: 'PENDING' });
    setupHooks([vendor]);
    render(<AdminVendorsPage />);

    fireEvent.click(screen.getByTestId('action-approved-vendor-1'));
    expect(screen.getByTestId('status-confirm-dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('cancel-btn'));
    await waitFor(() => {
      expect(screen.queryByTestId('status-confirm-dialog')).toBeNull();
    });

    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('renders error state when isError is true', () => {
    setupHooks([], { isError: true });
    render(<AdminVendorsPage />);

    expect(screen.getByText('admin_vendors.error_occurred')).toBeInTheDocument();
  });

  it('refetch button is rendered and clickable', () => {
    setupHooks([]);
    render(<AdminVendorsPage />);

    // Refetch button is inside PageHeader actions
    const refreshButtons = screen.getAllByRole('button');
    const refreshBtn = refreshButtons.find((b) => b.textContent?.includes('Yenilə'));
    expect(refreshBtn).toBeDefined();
    fireEvent.click(refreshBtn!);
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('renders pagination when data has multiple pages', () => {
    const vendor = buildVendor();
    (useAdminVendors as Mock).mockReturnValue({
      data: {
        success: true,
        data: [vendor],
        pagination: { page: 1, limit: 10, total: 25, pages: 3 },
      },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    });

    render(<AdminVendorsPage />);
    expect(screen.getByTestId('pagination')).toBeInTheDocument();
  });

  it('confirm with empty note does not include note in payload', async () => {
    const vendor = buildVendor({ status: 'PENDING' });
    setupHooks([vendor]);
    render(<AdminVendorsPage />);

    fireEvent.click(screen.getByTestId('action-approved-vendor-1'));

    await act(async () => {
      fireEvent.click(screen.getByTestId('confirm-btn'));
    });

    expect(mockMutateAsync).toHaveBeenCalledWith({
      id: 'vendor-1',
      status: 'APPROVED',
      note: undefined,
    });
  });
});
