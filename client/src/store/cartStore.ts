// src/store/cartStore.ts
// Zustand cart store — API-synced cart state with optimistic local itemCount

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { api, parseApiError } from '@/lib/api';
import type { Cart, ApiResponse } from '@/types';

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
  isHydrated: boolean;

  // Actions
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  setHydrated: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: null,
      isLoading: false,
      isMutating: false,
      error: null,
      isHydrated: false,

      setHydrated: () => set({ isHydrated: true }),

      fetchCart: async () => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.get<ApiResponse<Cart>>('/cart');
          set({ cart: data.data });
        } catch (err) {
          set({ error: parseApiError(err) });
        } finally {
          set({ isLoading: false });
        }
      },

      addItem: async (productId, quantity = 1) => {
        set({ isMutating: true, error: null });
        try {
          const { data } = await api.post<ApiResponse<Cart>>('/cart/items', {
            productId,
            quantity,
          });
          set({ cart: data.data });
        } catch (err) {
          set({ error: parseApiError(err) });
          throw err;
        } finally {
          set({ isMutating: false });
        }
      },

      updateItem: async (productId, quantity) => {
        set({ isMutating: true, error: null });
        try {
          const { data } = await api.patch<ApiResponse<Cart>>(
            `/cart/items/${productId}`,
            { quantity }
          );
          set({ cart: data.data });
        } catch (err) {
          set({ error: parseApiError(err) });
          throw err;
        } finally {
          set({ isMutating: false });
        }
      },

      removeItem: async (productId) => {
        // Optimistic update — remove locally first
        const prev = get().cart;
        if (prev) {
          const optimistic: Cart = {
            ...prev,
            items: prev.items.filter((i) => i.product.id !== productId),
            itemCount: prev.items
              .filter((i) => i.product.id !== productId)
              .reduce((s, i) => s + i.quantity, 0),
            subtotal: prev.items
              .filter((i) => i.product.id !== productId)
              .reduce((s, i) => s + i.quantity * i.product.price, 0),
          };
          set({ cart: optimistic });
        }

        set({ isMutating: true, error: null });
        try {
          const { data } = await api.delete<ApiResponse<Cart>>(
            `/cart/items/${productId}`
          );
          set({ cart: data.data });
        } catch (err) {
          // Rollback on failure
          set({ cart: prev, error: parseApiError(err) });
          throw err;
        } finally {
          set({ isMutating: false });
        }
      },

      clearCart: async () => {
        set({ isMutating: true, error: null });
        try {
          const { data } = await api.delete<ApiResponse<Cart>>('/cart');
          set({ cart: data.data });
        } catch (err) {
          set({ error: parseApiError(err) });
          throw err;
        } finally {
          set({ isMutating: false });
        }
      },
    }),
    {
      name: 'shopflow-cart',
      // Only persist lightweight summary — full data fetched fresh on mount
      partialize: (state) => ({
        cart: state.cart
          ? { id: state.cart.id, itemCount: state.cart.itemCount, subtotal: state.cart.subtotal, items: [] }
          : null,
      }),
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
