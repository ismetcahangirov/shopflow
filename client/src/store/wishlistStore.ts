// src/store/wishlistStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface WishlistState {
  likedIds: string[];
  isHydrated: boolean;
  toggleWishlist: (productId: string) => void;
  isLiked: (productId: string) => boolean;
  setHydrated: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      likedIds: [],
      isHydrated: false,

      setHydrated: () => set({ isHydrated: true }),

      toggleWishlist: (productId) => {
        const current = get().likedIds;
        if (current.includes(productId)) {
          set({ likedIds: current.filter((id) => id !== productId) });
        } else {
          set({ likedIds: [...current, productId] });
        }
      },

      isLiked: (productId) => get().likedIds.includes(productId),
    }),
    {
      name: 'wishlist-store',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
