import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { render, screen, fireEvent, within, act } from '@testing-library/react';
import AdminUsersPage from './page';
import { useAdminUsers, useToggleUserStatus } from '@/hooks/useUser';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: (namespace?: string) => (key: string) => {
    return namespace ? `${namespace}.${key}` : key;
  },
}));

// Mock hooks
vi.mock('@/hooks/useUser', () => ({
  useAdminUsers: vi.fn(),
  useToggleUserStatus: vi.fn(),
}));

// Mock UI components to simplify test rendering and prevent portal/modal errors
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

interface MockAvatarProps {
  src?: string | null;
  fallback: string;
}

vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({ src, fallback }: MockAvatarProps) => (
    <div data-testid="mock-avatar" data-src={src || ''} data-fallback={fallback}>
      Avatar: {fallback}
    </div>
  ),
}));

describe('AdminUsersPage component tests', () => {
  const mockUsers = [
    {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@test.com',
      role: 'CUSTOMER',
      avatar: null,
      isActive: true,
      isVerified: true,
      createdAt: '2026-06-08T10:00:00Z',
      _count: { orders: 5 },
    },
    {
      id: 'user-2',
      name: 'Vendor User',
      email: 'vendor@test.com',
      role: 'VENDOR',
      avatar: 'https://avatar.com/vendor',
      isActive: false,
      isVerified: true,
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
      isVerified: true,
      createdAt: '2026-06-10T12:00:00Z',
      _count: { orders: 0 },
    },
  ];

  const mockToggleStatusMutateAsync = vi.fn();
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    (useAdminUsers as Mock).mockReturnValue({
      data: {
        data: mockUsers,
        pagination: { total: 3, pages: 1, page: 1, limit: 10 },
      },
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    });

    (useToggleUserStatus as Mock).mockReturnValue({
      mutateAsync: mockToggleStatusMutateAsync,
      isPending: false,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders loading skeleton when isLoading is true', () => {
    (useAdminUsers as Mock).mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    });

    render(<AdminUsersPage />);
    expect(screen.getByTestId('mock-page-header')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('renders empty state when no users are found', () => {
    (useAdminUsers as Mock).mockReturnValue({
      data: {
        data: [],
        pagination: { total: 0, pages: 0, page: 1, limit: 10 },
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    render(<AdminUsersPage />);
    expect(screen.getByText('admin_users.no_users')).toBeInTheDocument();
  });

  it('renders users list table correctly', () => {
    render(<AdminUsersPage />);

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@test.com')).toBeInTheDocument();
    expect(screen.getByText('Vendor User')).toBeInTheDocument();
    expect(screen.getByText('vendor@test.com')).toBeInTheDocument();
    expect(screen.getByText('Admin User')).toBeInTheDocument();
    expect(screen.getByText('admin@shopflow.az')).toBeInTheDocument();
  });

  it('handles role filter updates', () => {
    render(<AdminUsersPage />);

    const vendorBtn = screen.getByRole('button', { name: 'admin_users.vendor' });
    fireEvent.click(vendorBtn);

    expect(useAdminUsers).toHaveBeenLastCalledWith(
      expect.objectContaining({
        role: 'VENDOR',
        page: 1,
      })
    );
  });

  it('handles status filter updates', () => {
    render(<AdminUsersPage />);

    const inactiveBtn = screen.getByRole('button', { name: 'admin_users.inactive' });
    fireEvent.click(inactiveBtn);

    expect(useAdminUsers).toHaveBeenLastCalledWith(
      expect.objectContaining({
        isActive: false,
        page: 1,
      })
    );
  });

  it('handles search input with 300ms debouncing', () => {
    render(<AdminUsersPage />);

    const searchInput = screen.getByTestId('search-users-input');
    fireEvent.change(searchInput, { target: { value: 'alice' } });

    // Should not trigger query immediately
    expect(useAdminUsers).not.toHaveBeenLastCalledWith(
      expect.objectContaining({
        search: 'alice',
      })
    );

    // Advance timers by 300ms
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(useAdminUsers).toHaveBeenLastCalledWith(
      expect.objectContaining({
        search: 'alice',
        page: 1,
      })
    );
  });

  it('opens confirm modal and toggles user status when confirm button is clicked', async () => {
    render(<AdminUsersPage />);

    const rows = screen.getAllByRole('row');
    // Row 0: Header, Row 1: John Doe (Customer), Row 2: Vendor User (Vendor), Row 3: Admin User (Admin)
    
    // Vendor is inactive, click button to activate (confirm toggle)
    const vendorRowActionBtn = within(rows[2]).getByRole('button');
    fireEvent.click(vendorRowActionBtn);

    expect(screen.getByTestId('mock-confirm-dialog')).toBeInTheDocument();
    expect(screen.getByText('admin_users.toggle_status_confirm')).toBeInTheDocument();

    const confirmBtn = screen.getByTestId('confirm-btn');
    
    await act(async () => {
      fireEvent.click(confirmBtn);
    });

    expect(mockToggleStatusMutateAsync).toHaveBeenCalledWith({
      id: 'user-2',
      isActive: true,
    });
  });

  it('disables toggle status button for admin users', () => {
    render(<AdminUsersPage />);

    const rows = screen.getAllByRole('row');
    // Row 3 is Admin User
    const adminActionBtn = within(rows[3]).getByRole('button');
    
    expect(adminActionBtn).toBeDisabled();
  });
});
