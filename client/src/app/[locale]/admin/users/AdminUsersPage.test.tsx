import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import AdminUsersPage from './page';
import { useAdminUsers, useToggleUserStatus } from '@/hooks/useUser';

vi.mock('next-intl', () => ({
  useTranslations: (namespace?: string) => (key: string) =>
    namespace ? `${namespace}.${key}` : key,
}));

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock('@/hooks/useUser', () => ({
  useAdminUsers: vi.fn(),
  useToggleUserStatus: vi.fn(),
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

vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({ fallback }: { fallback: string }) => <div data-testid="mock-avatar">{fallback[0]}</div>,
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
  AdminConfirmDialog: ({ open, onConfirm, onOpenChange, title }: any) =>
    open ? (
      <div data-testid="confirm-dialog">
        <h2>{title}</h2>
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

describe('AdminUsersPage', () => {
  const mockUsers = [
    {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@test.com',
      role: 'CUSTOMER',
      avatar: null,
      isActive: true,
      createdAt: '2026-06-08T10:00:00Z',
      _count: { orders: 5 },
    },
    {
      id: 'user-2',
      name: 'Vendor User',
      email: 'vendor@test.com',
      role: 'VENDOR',
      avatar: null,
      isActive: false,
      createdAt: '2026-06-09T11:00:00Z',
      _count: { orders: 0 },
    },
    {
      id: 'user-3',
      name: 'Admin User',
      email: 'admin@shopflow.az',
      role: 'ADMIN',
      avatar: null,
      isActive: true,
      createdAt: '2026-06-10T12:00:00Z',
      _count: { orders: 0 },
    },
  ];

  const mockToggle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockToggle.mockResolvedValue(undefined);

    (useAdminUsers as Mock).mockReturnValue({
      data: { data: mockUsers, pagination: { total: 3, pages: 1, page: 1, limit: 10 } },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    (useToggleUserStatus as Mock).mockReturnValue({ mutateAsync: mockToggle, isPending: false });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders loading state', () => {
    (useAdminUsers as Mock).mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    });
    render(<AdminUsersPage />);
    expect(screen.getByTestId('dt-loading')).toBeInTheDocument();
  });

  it('renders empty state', () => {
    (useAdminUsers as Mock).mockReturnValue({
      data: { data: [], pagination: { total: 0, pages: 0, page: 1, limit: 10 } },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    render(<AdminUsersPage />);
    expect(screen.getByText('admin_users.no_users')).toBeInTheDocument();
  });

  it('renders users list', () => {
    render(<AdminUsersPage />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@test.com')).toBeInTheDocument();
    expect(screen.getByText('Vendor User')).toBeInTheDocument();
    expect(screen.getByText('Admin User')).toBeInTheDocument();
  });

  it('renders fallbacks for a user with no name and no order count', () => {
    (useAdminUsers as Mock).mockReturnValue({
      data: {
        data: [
          {
            id: 'u9',
            name: '',
            email: 'x@y.z',
            role: 'CUSTOMER',
            avatar: null,
            isActive: true,
            createdAt: '2026-06-08T10:00:00Z',
          },
        ],
        pagination: { total: 1, pages: 1, page: 1, limit: 10 },
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    render(<AdminUsersPage />);
    expect(screen.getByText('İstifadəçi')).toBeInTheDocument();
    expect(screen.getByText('x@y.z')).toBeInTheDocument();
  });

  it('role filter refetches with role', () => {
    render(<AdminUsersPage />);
    fireEvent.change(screen.getByTestId('filter-admin_users.role_filter'), {
      target: { value: 'VENDOR' },
    });
    expect(useAdminUsers).toHaveBeenLastCalledWith(
      expect.objectContaining({ role: 'VENDOR', page: 1 }),
    );
  });

  it('status filter refetches with isActive', () => {
    render(<AdminUsersPage />);
    fireEvent.change(screen.getByTestId('filter-admin_users.status_filter'), {
      target: { value: 'INACTIVE' },
    });
    expect(useAdminUsers).toHaveBeenLastCalledWith(
      expect.objectContaining({ isActive: false, page: 1 }),
    );
  });

  it('search input debounces before refetching', () => {
    render(<AdminUsersPage />);
    fireEvent.change(screen.getByTestId('dt-search'), { target: { value: 'alice' } });
    expect(useAdminUsers).not.toHaveBeenLastCalledWith(
      expect.objectContaining({ search: 'alice' }),
    );
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(useAdminUsers).toHaveBeenLastCalledWith(
      expect.objectContaining({ search: 'alice', page: 1 }),
    );
  });

  it('toggling a non-admin user opens confirm and calls the mutation', async () => {
    render(<AdminUsersPage />);
    // user-2 is inactive -> "activate" action is shown
    fireEvent.click(screen.getByText('admin_users.activate'));
    expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(screen.getByTestId('confirm-btn'));
    });
    expect(mockToggle).toHaveBeenCalledWith({ id: 'user-2', isActive: true });
  });

  it('admin users cannot be toggled (disabled control)', () => {
    render(<AdminUsersPage />);
    const adminBtn = screen.getByLabelText('admin_users.cannot_toggle_admin');
    expect(adminBtn).toBeDisabled();
  });
});
