// src/store/cartStore.test.ts
// Unit tests for the Zustand cartStore

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCartStore } from './cartStore';
import { api } from '@/lib/api';
import type { Cart } from '@/types';

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
  parseApiError: vi.fn((err: unknown) => {
    const error = err as { message?: string } | null | undefined;
    return error?.message || 'Xəta baş verdi';
  }),
}));

const mockCart: Cart = {
  id: 'cart-123',
  itemCount: 2,
  subtotal: 120.00,
  items: [
    {
      id: 'item-1',
      quantity: 2,
      product: {
        id: 'prod-1',
        name: 'Məhsul 1',
        slug: 'product-1',
        price: 60.00,
        stock: 10,
        image: '/images/prod-1.png',
      },
    },
  ],
};

describe('cartStore tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCartStore.setState({
      cart: null,
      isLoading: false,
      isMutating: false,
      error: null,
      isHydrated: true,
    });
  });

  it('should initialize with default states', () => {
    const state = useCartStore.getState();
    expect(state.cart).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.isMutating).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle fetchCart success', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: { success: true, data: mockCart },
    });

    const store = useCartStore.getState();
    await store.fetchCart();

    const state = useCartStore.getState();
    expect(state.cart).toEqual(mockCart);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle fetchCart failure', async () => {
    const mockError = { message: 'Fetch failed' };
    vi.mocked(api.get).mockRejectedValueOnce(mockError);

    const store = useCartStore.getState();
    await store.fetchCart();

    const state = useCartStore.getState();
    expect(state.cart).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe('Fetch failed');
  });

  it('should handle addItem success', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({
      data: { success: true, data: mockCart },
    });

    const store = useCartStore.getState();
    await store.addItem('prod-1', 2);

    const state = useCartStore.getState();
    expect(state.cart).toEqual(mockCart);
    expect(state.isMutating).toBe(false);
  });

  it('should handle updateItem success', async () => {
    const updatedCart = {
      ...mockCart,
      itemCount: 3,
      subtotal: 180.00,
      items: [
        {
          ...mockCart.items[0],
          quantity: 3,
        },
      ],
    };

    vi.mocked(api.patch).mockResolvedValueOnce({
      data: { success: true, data: updatedCart },
    });

    const store = useCartStore.getState();
    await store.updateItem('prod-1', 3);

    const state = useCartStore.getState();
    expect(state.cart).toEqual(updatedCart);
    expect(state.isMutating).toBe(false);
  });

  it('should perform optimistic delete and sync with API successfully', async () => {
    // Populate store initially
    useCartStore.setState({ cart: mockCart });

    const emptyCart = {
      id: 'cart-123',
      itemCount: 0,
      subtotal: 0,
      items: [],
    };

    vi.mocked(api.delete).mockResolvedValueOnce({
      data: { success: true, data: emptyCart },
    });

    const store = useCartStore.getState();
    const removePromise = store.removeItem('prod-1');

    // Immediately after call, state should be optimistically updated
    expect(useCartStore.getState().cart?.items.length).toBe(0);
    expect(useCartStore.getState().cart?.itemCount).toBe(0);
    expect(useCartStore.getState().cart?.subtotal).toBe(0);

    await removePromise;

    // After resolution, final state should be correct
    expect(useCartStore.getState().cart).toEqual(emptyCart);
    expect(useCartStore.getState().isMutating).toBe(false);
  });

  it('should rollback state if optimistic delete fails', async () => {
    // Populate store initially
    useCartStore.setState({ cart: mockCart });

    vi.mocked(api.delete).mockRejectedValueOnce(new Error('Delete error'));

    const store = useCartStore.getState();
    
    await expect(store.removeItem('prod-1')).rejects.toThrow('Delete error');

    // After failure, state should be rolled back to initial mockCart
    expect(useCartStore.getState().cart).toEqual(mockCart);
    expect(useCartStore.getState().error).toBe('Delete error');
  });

  it('should handle clearCart success', async () => {
    const clearedCart = {
      id: 'cart-123',
      itemCount: 0,
      subtotal: 0,
      items: [],
    };

    vi.mocked(api.delete).mockResolvedValueOnce({
      data: { success: true, data: clearedCart },
    });

    const store = useCartStore.getState();
    await store.clearCart();

    const state = useCartStore.getState();
    expect(state.cart).toEqual(clearedCart);
    expect(state.isMutating).toBe(false);
  });
});
