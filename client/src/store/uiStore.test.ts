// src/store/uiStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useUiStore } from './uiStore';

describe('useUiStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useUiStore.setState({
      isSidebarOpen: false,
      isSearchOpen: false,
      isCartOpen: false,
    });
  });

  it('has correct initial state', () => {
    const { isSidebarOpen, isSearchOpen, isCartOpen } = useUiStore.getState();
    expect(isSidebarOpen).toBe(false);
    expect(isSearchOpen).toBe(false);
    expect(isCartOpen).toBe(false);
  });

  it('openSidebar sets isSidebarOpen to true', () => {
    useUiStore.getState().openSidebar();
    expect(useUiStore.getState().isSidebarOpen).toBe(true);
  });

  it('closeSidebar sets isSidebarOpen to false', () => {
    useUiStore.setState({ isSidebarOpen: true });
    useUiStore.getState().closeSidebar();
    expect(useUiStore.getState().isSidebarOpen).toBe(false);
  });

  it('toggleSidebar flips isSidebarOpen from false to true', () => {
    useUiStore.getState().toggleSidebar();
    expect(useUiStore.getState().isSidebarOpen).toBe(true);
  });

  it('toggleSidebar flips isSidebarOpen from true to false', () => {
    useUiStore.setState({ isSidebarOpen: true });
    useUiStore.getState().toggleSidebar();
    expect(useUiStore.getState().isSidebarOpen).toBe(false);
  });

  it('openSearch sets isSearchOpen to true', () => {
    useUiStore.getState().openSearch();
    expect(useUiStore.getState().isSearchOpen).toBe(true);
  });

  it('closeSearch sets isSearchOpen to false', () => {
    useUiStore.setState({ isSearchOpen: true });
    useUiStore.getState().closeSearch();
    expect(useUiStore.getState().isSearchOpen).toBe(false);
  });

  it('openCart sets isCartOpen to true', () => {
    useUiStore.getState().openCart();
    expect(useUiStore.getState().isCartOpen).toBe(true);
  });

  it('closeCart sets isCartOpen to false', () => {
    useUiStore.setState({ isCartOpen: true });
    useUiStore.getState().closeCart();
    expect(useUiStore.getState().isCartOpen).toBe(false);
  });
});
