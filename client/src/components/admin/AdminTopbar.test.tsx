// src/components/admin/AdminTopbar.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AdminTopbar, adminBreadcrumbItems } from './AdminTopbar';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), prefetch: () => null, replace: () => null, back: () => null }),
  usePathname: () => '/az/admin/products',
  useSearchParams: () => new URLSearchParams(),
}));

const logoutMock = vi.fn();
vi.mock('@/store/authStore', () => ({
  useAuthStore: () => ({
    user: { id: '1', name: 'Ada Admin', email: 'ada@shopflow.az', role: 'ADMIN' },
    logout: logoutMock,
  }),
}));

// Real cmdk does not run under jsdom; reflect only open state.
vi.mock('./AdminCommandPalette', () => ({
  AdminCommandPalette: ({ open }: { open: boolean }) => (open ? <div>palette-open</div> : null),
}));

// Render the dropdown content inline so profile/logout items are assertable.
vi.mock('@/components/ui/dropdown-menu', async () => {
  const { cloneElement } = await import('react');
  const Passthrough = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  return {
    DropdownMenu: Passthrough,
    DropdownMenuContent: Passthrough,
    DropdownMenuLabel: Passthrough,
    DropdownMenuSeparator: () => <hr />,
    DropdownMenuTrigger: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
      <button {...props}>{children}</button>
    ),
    DropdownMenuItem: ({
      children,
      render,
      onClick,
    }: {
      children: React.ReactNode;
      render?: React.ReactElement;
      onClick?: () => void;
    }) =>
      render ? (
        cloneElement(render, { onClick } as React.HTMLAttributes<HTMLElement>, children)
      ) : (
        <div role="menuitem" onClick={onClick}>
          {children}
        </div>
      ),
  };
});

function renderTopbar() {
  return render(
    <TooltipProvider>
      <SidebarProvider>
        <AdminTopbar />
      </SidebarProvider>
    </TooltipProvider>,
  );
}

describe('adminBreadcrumbItems', () => {
  it('resolves labelKeys for known admin routes', () => {
    expect(adminBreadcrumbItems('/az/admin', 'az')).toEqual([
      { href: '/admin', labelKey: 'nav_dashboard', raw: 'admin' },
    ]);
    expect(adminBreadcrumbItems('/az/admin/products', 'az')).toEqual([
      { href: '/admin', labelKey: 'nav_dashboard', raw: 'admin' },
      { href: '/admin/products', labelKey: 'nav_products', raw: 'products' },
    ]);
  });

  it('leaves unknown deep segments unlabeled', () => {
    const crumbs = adminBreadcrumbItems('/az/admin/orders/42', 'az');
    expect(crumbs).toHaveLength(3);
    expect(crumbs[2]).toEqual({ href: '/admin/orders/42', labelKey: null, raw: '42' });
  });

  it('returns an empty list at the locale root and stays locale-aware', () => {
    expect(adminBreadcrumbItems('/az', 'az')).toEqual([]);
    expect(adminBreadcrumbItems('/en/admin', 'en')).toEqual([
      { href: '/admin', labelKey: 'nav_dashboard', raw: 'admin' },
    ]);
  });
});

describe('AdminTopbar', () => {
  beforeEach(() => logoutMock.mockClear());

  it('renders route breadcrumbs from the current path', () => {
    renderTopbar();
    expect(screen.getByText('nav_dashboard')).toBeInTheDocument();
    expect(screen.getByText('nav_products')).toBeInTheDocument();
  });

  it('opens the command palette via the search launcher and ⌘K', () => {
    renderTopbar();
    expect(screen.queryByText('palette-open')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'search' }));
    expect(screen.getByText('palette-open')).toBeInTheDocument();

    // ⌘K toggles it closed again.
    fireEvent.keyDown(document.body, { key: 'k', metaKey: true });
    expect(screen.queryByText('palette-open')).not.toBeInTheDocument();
  });

  it('shows the user menu with a profile link and a working logout', () => {
    renderTopbar();
    const profile = screen.getByText('user_menu.profile').closest('a');
    expect(profile).toHaveAttribute('href', '/az/account/settings');

    fireEvent.click(screen.getByText('user_menu.logout'));
    expect(logoutMock).toHaveBeenCalledTimes(1);
  });
});
