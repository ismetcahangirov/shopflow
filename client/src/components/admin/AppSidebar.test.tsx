// src/components/admin/AppSidebar.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { LucideIcon } from 'lucide-react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AppSidebar, isNavItemActive, groupAdminNav } from './AppSidebar';
import { adminNavItems } from '@/config/navItems';

const logoutMock = vi.fn();
vi.mock('@/store/authStore', () => ({
  useAuthStore: () => ({
    user: { id: '1', name: 'Ada Admin', email: 'ada@shopflow.az', role: 'ADMIN' },
    logout: logoutMock,
  }),
}));

function renderSidebar() {
  return render(
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
      </SidebarProvider>
    </TooltipProvider>,
  );
}

describe('isNavItemActive', () => {
  it('matches /admin (dashboard) only on an exact path', () => {
    expect(isNavItemActive('/admin', '/az/admin', 'az')).toBe(true);
    expect(isNavItemActive('/admin', '/az/admin/products', 'az')).toBe(false);
  });

  it('matches other items on exact or nested paths', () => {
    expect(isNavItemActive('/admin/products', '/az/admin/products', 'az')).toBe(true);
    expect(isNavItemActive('/admin/products', '/az/admin/products/42', 'az')).toBe(true);
    expect(isNavItemActive('/admin/products', '/az/admin/orders', 'az')).toBe(false);
  });

  it('is locale-aware', () => {
    expect(isNavItemActive('/admin/orders', '/en/admin/orders', 'en')).toBe(true);
    expect(isNavItemActive('/admin/orders', '/az/admin/orders', 'en')).toBe(false);
  });
});

describe('groupAdminNav', () => {
  it('returns ordered, non-empty sections covering every item', () => {
    const sections = groupAdminNav(adminNavItems);
    expect(sections.map((s) => s.group)).toEqual(['overview', 'catalog', 'sales', 'people', 'system']);
    expect(sections.flatMap((s) => s.items)).toHaveLength(adminNavItems.length);
  });

  it('drops groups that have no items', () => {
    const icon = (() => null) as unknown as LucideIcon;
    const sections = groupAdminNav([{ label: 'x', href: '/admin', icon, group: 'overview' }]);
    expect(sections).toHaveLength(1);
    expect(sections[0].group).toBe('overview');
  });
});

describe('AppSidebar', () => {
  beforeEach(() => logoutMock.mockClear());

  it('renders every admin nav item and all group labels', () => {
    renderSidebar();
    for (const item of adminNavItems) {
      expect(screen.getAllByText(item.label).length).toBeGreaterThan(0);
    }
    for (const key of ['overview', 'catalog', 'sales', 'people', 'system']) {
      expect(screen.getByText(`groups.${key}`)).toBeInTheDocument();
    }
  });

  it('renders the brand and the current user', () => {
    renderSidebar();
    expect(screen.getByText('ShopFlow')).toBeInTheDocument();
    expect(screen.getByText('Ada Admin')).toBeInTheDocument();
    expect(screen.getByText('ada@shopflow.az')).toBeInTheDocument();
  });

  it('calls logout when the footer logout button is clicked', () => {
    renderSidebar();
    fireEvent.click(screen.getByText('user_menu.logout'));
    expect(logoutMock).toHaveBeenCalledTimes(1);
  });
});
