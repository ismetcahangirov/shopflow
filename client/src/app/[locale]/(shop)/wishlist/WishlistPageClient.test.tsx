// src/app/[locale]/(shop)/wishlist/WishlistPageClient.test.tsx
// Component tests for WishlistPageClient validating auth guard, loading, error, empty and list states

import React from 'react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WishlistPageClient from './WishlistPageClient';
import { useWishlist, useRemoveFromWishlist } from '@/hooks/useWishlist';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';

vi.mock('@/hooks/useWishlist', () => ({
  useWishlist: vi.fn(),
  useRemoveFromWishlist: vi.fn(),
}));
vi.mock('@/store/authStore', () => ({
  useAuthStore: vi.fn(),
}));
vi.mock('@/store/cartStore', () => ({
  useCartStore: vi.fn(),
}));

const authed = { isAuthenticated: true, isHydrated: true };

function setAuth(value: Record<string, unknown>) {
  (useAuthStore as unknown as Mock).mockReturnValue(value);
}
function setWishlist(value: Record<string, unknown>) {
  (useWishlist as unknown as Mock).mockReturnValue(value);
}

beforeEach(() => {
  vi.clearAllMocks();
  (useRemoveFromWishlist as unknown as Mock).mockReturnValue({ mutate: vi.fn(), isPending: false });
  (useCartStore as unknown as Mock).mockReturnValue(vi.fn());
  // Default query result — individual tests override as needed
  setWishlist({ data: [], isLoading: false, isError: false, error: null, refetch: vi.fn() });
});

describe('WishlistPageClient component tests', () => {
  it('shows a loading skeleton while auth is still hydrating', () => {
    setAuth({ isAuthenticated: false, isHydrated: false });

    render(<WishlistPageClient />);

    expect(screen.getAllByTestId('skeleton-pulse').length).toBeGreaterThan(0);
    expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument();
  });

  it('shows a login prompt when the user is not authenticated', () => {
    setAuth({ isAuthenticated: false, isHydrated: true });

    render(<WishlistPageClient />);

    const loginLink = screen.getByRole('link', { name: /login/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', expect.stringContaining('/login'));
  });

  it('does not fire the wishlist query when the user is unauthenticated', () => {
    setAuth({ isAuthenticated: false, isHydrated: true });

    render(<WishlistPageClient />);

    expect(useWishlist).toHaveBeenCalledWith({ enabled: false });
  });

  it('shows a skeleton while the wishlist query is loading', () => {
    setAuth(authed);
    setWishlist({ data: undefined, isLoading: true, isError: false, error: null, refetch: vi.fn() });

    render(<WishlistPageClient />);

    expect(screen.getAllByTestId('skeleton-pulse').length).toBeGreaterThan(0);
  });

  it('shows an error state with a retry button when the query fails', () => {
    setAuth(authed);
    const refetch = vi.fn();
    setWishlist({ data: undefined, isLoading: false, isError: true, error: new Error('boom'), refetch });

    render(<WishlistPageClient />);

    expect(screen.getByTestId('error-state')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /yenidən/i }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('shows an empty state when the wishlist has no items', () => {
    setAuth(authed);
    setWishlist({ data: [], isLoading: false, isError: false, error: null, refetch: vi.fn() });

    render(<WishlistPageClient />);

    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  it('renders wishlist items when the query resolves with data', () => {
    setAuth(authed);
    setWishlist({
      data: [
        {
          id: 'w1',
          createdAt: '2024-01-01',
          product: { id: 'p1', name: 'Cozy Blanket', slug: 'cozy-blanket', price: 42, stock: 5, isActive: true, image: null },
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<WishlistPageClient />);

    expect(screen.getByText('Cozy Blanket')).toBeInTheDocument();
  });
});
