// src/components/cart/CartSummary.test.tsx
// Component tests for CartSummary: pricing computations and free shipping limits

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CartSummary } from './CartSummary';
import type { Cart } from '@/types';

const mockCart: Cart = {
  id: 'cart-123',
  itemCount: 2,
  subtotal: 100.00,
  items: [],
};

describe('CartSummary component tests', () => {
  it('renders summary correctly with shipping charge below free threshold', () => {
    render(<CartSummary cart={mockCart} />);

    expect(screen.getByText('summary')).toBeInTheDocument();
    expect(screen.getByText('100.00 AZN')).toBeInTheDocument(); // subtotal
    expect(screen.getByText('5.00 AZN')).toBeInTheDocument(); // shipping
    expect(screen.getByText('105.00 AZN')).toBeInTheDocument(); // total
  });

  it('renders free shipping when subtotal is above 150 AZN threshold', () => {
    const freeShippingCart = {
      ...mockCart,
      subtotal: 160.00,
    };
    render(<CartSummary cart={freeShippingCart} />);

    const priceElements = screen.getAllByText('160.00 AZN');
    expect(priceElements).toHaveLength(2); // subtotal and total
    expect(screen.getByText('free')).toBeInTheDocument(); // shipping
  });
});
