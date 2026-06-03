// src/store/wishlistStore.test.ts
// Unit tests for the Zustand wishlistStore (localStorage persist)

import { describe, it, expect, beforeEach } from 'vitest';
import { useWishlistStore } from './wishlistStore';

describe('wishlistStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useWishlistStore.setState({ likedIds: [], isHydrated: false });
  });

  it('initializes with empty likedIds and isHydrated false', () => {
    const state = useWishlistStore.getState();
    expect(state.likedIds).toEqual([]);
    expect(state.isHydrated).toBe(false);
  });

  it('toggleWishlist adds a product id when not present', () => {
    useWishlistStore.getState().toggleWishlist('prod-1');
    expect(useWishlistStore.getState().likedIds).toContain('prod-1');
  });

  it('toggleWishlist removes a product id when already present', () => {
    useWishlistStore.setState({ likedIds: ['prod-1', 'prod-2'] });
    useWishlistStore.getState().toggleWishlist('prod-1');
    expect(useWishlistStore.getState().likedIds).not.toContain('prod-1');
    expect(useWishlistStore.getState().likedIds).toContain('prod-2');
  });

  it('toggleWishlist can add multiple distinct products', () => {
    useWishlistStore.getState().toggleWishlist('prod-1');
    useWishlistStore.getState().toggleWishlist('prod-2');
    useWishlistStore.getState().toggleWishlist('prod-3');
    expect(useWishlistStore.getState().likedIds).toEqual(['prod-1', 'prod-2', 'prod-3']);
  });

  it('isLiked returns true for a liked product', () => {
    useWishlistStore.setState({ likedIds: ['prod-1'] });
    expect(useWishlistStore.getState().isLiked('prod-1')).toBe(true);
  });

  it('isLiked returns false for a non-liked product', () => {
    useWishlistStore.setState({ likedIds: ['prod-1'] });
    expect(useWishlistStore.getState().isLiked('prod-99')).toBe(false);
  });

  it('isLiked returns false when wishlist is empty', () => {
    expect(useWishlistStore.getState().isLiked('prod-1')).toBe(false);
  });

  it('setHydrated sets isHydrated to true', () => {
    expect(useWishlistStore.getState().isHydrated).toBe(false);
    useWishlistStore.getState().setHydrated();
    expect(useWishlistStore.getState().isHydrated).toBe(true);
  });

  it('toggling the same product twice results in empty list', () => {
    useWishlistStore.getState().toggleWishlist('prod-1');
    useWishlistStore.getState().toggleWishlist('prod-1');
    expect(useWishlistStore.getState().likedIds).toEqual([]);
  });
});
