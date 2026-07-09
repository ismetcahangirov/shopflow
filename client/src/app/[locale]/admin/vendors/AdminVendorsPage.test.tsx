import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';

import AdminVendorsPage from './page';
import {
  useAdminVendors,
  useUpdateVendorStatus,
  type AdminVendor,
  type VendorStatus,
} from '@/hooks/useVendor';
import type { ApiResponse } from '@/types';

vi.mock('next-intl', () => ({
  useTranslations: (namespace?: string) => (key: string) =>
    namespace ? `${namespace}.${key}` : key,
}));

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock('@/components/layout/Breadcrumb', () => ({
  Breadcrumb: () => <nav data-testid="breadcrumb" />,
}));

vi.mock('@/components/ui/page-header', () => ({
  PageHeader: ({ title, actions }: { title: React.ReactNode; actions?: React.ReactNode }) => (
    <div data-testid="page-header">
      <h1>{title}</h1>
      {actions}
    </div>
  ),
}));

vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({ fallback }: { fallback: string }) => <div data-testid="avatar">{fallback[0]}</div>,
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
  DataTable: ({ data, columns, isLoading, isError, emptyTitle, errorTitle, filters }: any) => {
    if (isLoading) return <div data-testid="dt-loading" />;
    return (
      <div>
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
  DropdownMenuItem: ({ children, onClick, disabled, ...rest }: any) => (
    <button type="button" onClick={onClick} disabled={disabled} data-testid={rest['data-testid']}>
      {children}
    </button>
  ),
  DropdownMenuSeparator: () => null,
}));

vi.mock('@/components/admin/AdminConfirmDialog', () => ({
  AdminConfirmDialog: ({ open, onConfirm, onOpenChange, children }: any) =>
    open ? (
      <div data-testid="status-confirm-dialog">
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

vi.mock('@/hooks/useVendor', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/hooks/useVendor')>();
  return { ...actual, useAdminVendors: vi.fn(), useUpdateVendorStatus: vi.fn() };
});

const mockRefetch = vi.fn();
const mockMutateAsync = vi.fn();

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
    user: { id: 'user-1', name: 'Ali Mammadov', email: 'ali@test.az' },
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

function setupHooks(vendors: AdminVendor[] = [], opts: { isLoading?: boolean; isError?: boolean } = {}) {
  (useAdminVendors as Mock).mockReturnValue({
    data: opts.isLoading || opts.isError ? undefined : buildApiResponse(vendors),
    isLoading: opts.isLoading ?? false,
    isError: opts.isError ?? false,
    refetch: mockRefetch,
  });
  (useUpdateVendorStatus as Mock).mockReturnValue({ mutateAsync: mockMutateAsync, isPending: false });
}

describe('AdminVendorsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMutateAsync.mockResolvedValue({ id: 'vendor-1', status: 'APPROVED' as VendorStatus });
  });

  it('renders loading state', () => {
    setupHooks([], { isLoading: true });
    render(<AdminVendorsPage />);
    expect(screen.getByTestId('dt-loading')).toBeInTheDocument();
    expect(screen.getByTestId('page-header')).toBeInTheDocument();
  });

  it('renders empty state', () => {
    setupHooks([]);
    render(<AdminVendorsPage />);
    expect(screen.getByText('admin_vendors.no_vendors')).toBeInTheDocument();
  });

  it('renders vendor store name and owner info', () => {
    setupHooks([buildVendor({ storeName: 'Tech Store', user: { id: 'u1', name: 'Ali', email: 'ali@test.az' } })]);
    render(<AdminVendorsPage />);
    expect(screen.getByText('Tech Store')).toBeInTheDocument();
    expect(screen.getByText('Ali')).toBeInTheDocument();
    expect(screen.getByText('ali@test.az')).toBeInTheDocument();
  });

  it('renders the status filter', () => {
    setupHooks([]);
    render(<AdminVendorsPage />);
    expect(screen.getByTestId('filter-admin_vendors.status_filter')).toBeInTheDocument();
  });

  it('changing the status filter refetches with the status', () => {
    setupHooks([]);
    render(<AdminVendorsPage />);
    fireEvent.change(screen.getByTestId('filter-admin_vendors.status_filter'), {
      target: { value: 'PENDING' },
    });
    expect(useAdminVendors).toHaveBeenCalledWith(expect.objectContaining({ status: 'PENDING', page: 1 }));
  });

  it('PENDING vendor shows approve and reject actions', () => {
    setupHooks([buildVendor({ status: 'PENDING' })]);
    render(<AdminVendorsPage />);
    expect(screen.getByTestId('action-approved-vendor-1')).toBeInTheDocument();
    expect(screen.getByTestId('action-rejected-vendor-1')).toBeInTheDocument();
    expect(screen.queryByTestId('action-suspended-vendor-1')).toBeNull();
  });

  it('APPROVED vendor shows suspend and reject actions', () => {
    setupHooks([buildVendor({ status: 'APPROVED' })]);
    render(<AdminVendorsPage />);
    expect(screen.getByTestId('action-suspended-vendor-1')).toBeInTheDocument();
    expect(screen.getByTestId('action-rejected-vendor-1')).toBeInTheDocument();
    expect(screen.queryByTestId('action-approved-vendor-1')).toBeNull();
  });

  it('clicking an action opens the confirmation dialog with the note field', () => {
    setupHooks([buildVendor({ status: 'PENDING' })]);
    render(<AdminVendorsPage />);
    fireEvent.click(screen.getByTestId('action-approved-vendor-1'));
    expect(screen.getByTestId('status-confirm-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('vendor-status-note')).toBeInTheDocument();
  });

  it('confirm calls mutateAsync with the note', async () => {
    setupHooks([buildVendor({ status: 'PENDING' })]);
    render(<AdminVendorsPage />);
    fireEvent.click(screen.getByTestId('action-approved-vendor-1'));
    fireEvent.change(screen.getByTestId('vendor-status-note'), { target: { value: 'Looks good' } });
    await act(async () => {
      fireEvent.click(screen.getByTestId('confirm-btn'));
    });
    expect(mockMutateAsync).toHaveBeenCalledWith({ id: 'vendor-1', status: 'APPROVED', note: 'Looks good' });
  });

  it('confirm with an empty note omits note from the payload', async () => {
    setupHooks([buildVendor({ status: 'PENDING' })]);
    render(<AdminVendorsPage />);
    fireEvent.click(screen.getByTestId('action-approved-vendor-1'));
    await act(async () => {
      fireEvent.click(screen.getByTestId('confirm-btn'));
    });
    expect(mockMutateAsync).toHaveBeenCalledWith({ id: 'vendor-1', status: 'APPROVED', note: undefined });
  });

  it('cancel closes the dialog without mutating', async () => {
    setupHooks([buildVendor({ status: 'PENDING' })]);
    render(<AdminVendorsPage />);
    fireEvent.click(screen.getByTestId('action-approved-vendor-1'));
    fireEvent.click(screen.getByTestId('cancel-btn'));
    await waitFor(() => expect(screen.queryByTestId('status-confirm-dialog')).toBeNull());
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('renders error state', () => {
    setupHooks([], { isError: true });
    render(<AdminVendorsPage />);
    expect(screen.getByText('admin_vendors.error_occurred')).toBeInTheDocument();
  });

  it('refresh button triggers refetch', () => {
    setupHooks([]);
    render(<AdminVendorsPage />);
    const refreshBtn = screen
      .getAllByRole('button')
      .find((b) => b.textContent?.includes('common.refresh'));
    expect(refreshBtn).toBeDefined();
    fireEvent.click(refreshBtn!);
    expect(mockRefetch).toHaveBeenCalled();
  });
});
