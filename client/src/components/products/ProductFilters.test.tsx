import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductFilters } from './ProductFilters';

// Mock categories hook
vi.mock('@/hooks/useCategories', () => ({
  useCategoriesQuery: () => ({
    data: [
      { id: 'cat-1', name: 'Phones', slug: 'phones', parentId: null },
      { id: 'cat-2', name: 'Laptops', slug: 'laptops', parentId: null },
    ],
    isLoading: false,
  }),
}));

const pushMock = vi.fn();
// Override next/navigation mock for this test to trace push calls
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: pushMock,
    };
  },
  usePathname() {
    return '/products';
  },
  useSearchParams() {
    return new URLSearchParams('brand=Apple&minPrice=10');
  },
}));

describe('ProductFilters', () => {
  beforeEach(() => {
    pushMock.mockClear();
  });

  it('renders filters, categories, and brands', () => {
    render(<ProductFilters />);
    
    expect(screen.getByText('filter_title')).toBeInTheDocument();
    expect(screen.getByText('Phones')).toBeInTheDocument();
    expect(screen.getByText('Laptops')).toBeInTheDocument();
    expect(screen.getByText('Apple')).toBeInTheDocument();
  });

  it('handles category selection and pushes updated query to URL', () => {
    render(<ProductFilters />);
    
    const phonesButton = screen.getByText('Phones');
    fireEvent.click(phonesButton);
    
    // Check that it calls router.push with categories added to URLSearchParams
    expect(pushMock).toHaveBeenCalledWith('/products?brand=Apple&minPrice=10&page=1&category=phones');
  });

  it('handles clear all filters but keeps search query if present', () => {
    render(<ProductFilters />);
    
    const clearButton = screen.getByRole('button', { name: /clear_all/i });
    fireEvent.click(clearButton);
    
    // It should clear brand and price params, navigating to /products
    expect(pushMock).toHaveBeenCalledWith('/products?sort=newest');
  });
});
