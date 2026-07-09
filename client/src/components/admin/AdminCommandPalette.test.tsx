// src/components/admin/AdminCommandPalette.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdminCommandPalette } from './AdminCommandPalette';
import { adminNavItems } from '@/config/navItems';

const pushMock = vi.hoisted(() => vi.fn());
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, prefetch: () => null, replace: () => null, back: () => null }),
  usePathname: () => '/az/admin',
  useSearchParams: () => new URLSearchParams(),
}));

// cmdk does not initialize under jsdom; stub the command primitives so we can
// test this component's own logic (item list, locale-aware navigate + close).
vi.mock('@/components/ui/command', () => ({
  CommandDialog: ({ open, children }: { open: boolean; children: React.ReactNode }) =>
    open ? <div role="dialog">{children}</div> : null,
  CommandInput: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
  CommandList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CommandEmpty: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CommandGroup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CommandItem: ({
    children,
    value,
    onSelect,
  }: {
    children: React.ReactNode;
    value?: string;
    onSelect?: () => void;
  }) => (
    <div data-value={value} onClick={onSelect}>
      {children}
    </div>
  ),
}));

describe('AdminCommandPalette', () => {
  beforeEach(() => pushMock.mockClear());

  it('renders nothing when closed', () => {
    render(<AdminCommandPalette open={false} onOpenChange={() => {}} />);
    expect(screen.queryByText('nav_dashboard')).not.toBeInTheDocument();
  });

  it('lists every admin nav item when open', () => {
    render(<AdminCommandPalette open onOpenChange={() => {}} />);
    for (const item of adminNavItems) {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    }
  });

  it('navigates locale-aware and closes on select', () => {
    const onOpenChange = vi.fn();
    render(<AdminCommandPalette open onOpenChange={onOpenChange} />);
    fireEvent.click(screen.getByText('nav_products'));
    expect(pushMock).toHaveBeenCalledWith('/az/admin/products');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
