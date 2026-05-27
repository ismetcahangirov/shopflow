// src/components/cart/CartItem.test.tsx
// Component tests for CartItem: render, quantity update triggers, and delete interactions

import React from 'react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CartItem } from './CartItem';
import { useCartStore } from '@/store/cartStore';

// Mock useCartStore
vi.mock('@/store/cartStore', () => ({
  useCartStore: vi.fn(),
}));

const mockItem = {
  id: 'item-1',
  quantity: 2,
  product: {
    id: 'prod-1',
    name: 'Test Product',
    slug: 'test-product',
    price: 50.00,
    stock: 5,
    image: null,
  },
};

describe('CartItem component tests', () => {
  const updateItemMock = vi.fn();
  const removeItemMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useCartStore as unknown as Mock).mockReturnValue({
      updateItem: updateItemMock,
      removeItem: removeItemMock,
      isMutating: false,
    });
  });

  it('renders cart item details correctly', () => {
    render(<CartItem item={mockItem} />);
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('100.00 AZN')).toBeInTheDocument(); // total 50 * 2 = 100
  });

  it('triggers updateItem when plus is clicked', () => {
    render(<CartItem item={mockItem} />);
    const plusButton = screen.getAllByRole('button')[1]; // Minus is index 0, Plus is index 1
    fireEvent.click(plusButton);
    expect(updateItemMock).toHaveBeenCalledWith('prod-1', 3);
  });

  it('triggers updateItem when minus is clicked', () => {
    render(<CartItem item={mockItem} />);
    const minusButton = screen.getAllByRole('button')[0];
    fireEvent.click(minusButton);
    expect(updateItemMock).toHaveBeenCalledWith('prod-1', 1);
  });

  it('triggers removeItem when trash icon is clicked', () => {
    render(<CartItem item={mockItem} />);
    const removeButton = screen.getAllByRole('button')[2];
    fireEvent.click(removeButton);
    expect(removeItemMock).toHaveBeenCalledWith('prod-1');
  });
});
