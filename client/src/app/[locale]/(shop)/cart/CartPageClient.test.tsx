// src/app/[locale]/(shop)/cart/CartPageClient.test.tsx
// Component tests for CartPageClient validating loading, auth guards, empty and full lists

import React from 'react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CartPageClient } from './CartPageClient';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';

// Mock both stores
vi.mock('@/store/cartStore', () => ({
  useCartStore: vi.fn(),
}));
vi.mock('@/store/authStore', () => ({
  useAuthStore: vi.fn(),
}));

// Mock ConfirmDialog to avoid complex DOM portal test errors
vi.mock('@/components/ui/confirm-dialog', () => ({
  ConfirmDialog: () => <div data-testid="mock-confirm-dialog" />
}));

describe('CartPageClient component tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state when stores are not hydrated or loading is true', () => {
    (useAuthStore as unknown as Mock).mockReturnValue({
      isAuthenticated: false,
      isHydrated: false,
    });
    (useCartStore as unknown as Mock).mockReturnValue({
      cart: null,
      isLoading: false,
      isHydrated: false,
    });

    render(<CartPageClient />);
    expect(screen.getByText('loading')).toBeInTheDocument();
  });

  it('renders login prompt when user is not authenticated', () => {
    (useAuthStore as unknown as Mock).mockReturnValue({
      isAuthenticated: false,
      isHydrated: true,
    });
    (useCartStore as unknown as Mock).mockReturnValue({
      cart: null,
      isLoading: false,
      isHydrated: true,
    });

    render(<CartPageClient />);
    expect(screen.getByText('Giriş edilməyib')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument();
  });

  it('renders empty cart message when cart has no items', () => {
    (useAuthStore as unknown as Mock).mockReturnValue({
      isAuthenticated: true,
      isHydrated: true,
    });
    (useCartStore as unknown as Mock).mockReturnValue({
      cart: { id: '1', itemCount: 0, subtotal: 0, items: [] },
      isLoading: false,
      isHydrated: true,
      fetchCart: vi.fn(),
    });

    render(<CartPageClient />);
    expect(screen.getByText('empty')).toBeInTheDocument();
  });

  it('renders items list and summary when cart has items', () => {
    const mockCart = {
      id: 'cart-123',
      itemCount: 1,
      subtotal: 50.00,
      items: [
        {
          id: 'item-1',
          quantity: 1,
          product: {
            id: 'prod-1',
            name: 'Deluxe Product',
            slug: 'deluxe-product',
            price: 50.00,
            stock: 5,
            image: null,
          },
        },
      ],
    };

    (useAuthStore as unknown as Mock).mockReturnValue({
      isAuthenticated: true,
      isHydrated: true,
    });
    (useCartStore as unknown as Mock).mockReturnValue({
      cart: mockCart,
      isLoading: false,
      isHydrated: true,
      fetchCart: vi.fn(),
    });

    render(<CartPageClient />);
    expect(screen.getByText('title')).toBeInTheDocument();
    expect(screen.getByText('Deluxe Product')).toBeInTheDocument();
    expect(screen.getByText('summary')).toBeInTheDocument();
  });
});
