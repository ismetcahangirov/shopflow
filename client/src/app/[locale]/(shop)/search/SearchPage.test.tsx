import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { Product } from '@/types';
import SearchPage, { generateMetadata } from './page';

// Mock next-intl/server
vi.mock('next-intl/server', () => ({
  getTranslations: async ({ namespace }: { namespace?: string }) => {
    return (key: string, variables?: Record<string, string | number | boolean>) => {
      if (variables && typeof variables.query === 'string') {
        return `${namespace ? `${namespace}.` : ''}${key}_with_query:${variables.query}`;
      }
      return `${namespace ? `${namespace}.` : ''}${key}`;
    };
  },
}));

// Mock components used in SearchPage to simplify testing
vi.mock('@/components/products/ProductFilters', () => ({
  ProductFilters: () => <div data-testid="product-filters">Product Filters</div>,
}));

vi.mock('@/components/products/ProductGrid', () => ({
  ProductGrid: ({ products }: { products: Pick<Product, 'id' | 'name' | 'slug' | 'price'>[] }) => (
    <div data-testid="product-grid">
      Product Grid: {products.length} items
      {products.map((p) => (
        <div key={p.id}>{p.name}</div>
      ))}
    </div>
  ),
}));

describe('SearchPage Server Component', () => {
  const mockProducts = [
    { id: '1', name: 'Product 1', slug: 'product-1', price: 100 },
    { id: '2', name: 'Product 2', slug: 'product-2', price: 200 },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders search page successfully with results', async () => {
    // Mock fetch for getSearchResults
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          products: mockProducts,
        },
        pagination: {
          total: 2,
          pages: 1,
          page: 1,
          limit: 20,
        },
      }),
    });
    global.fetch = fetchMock;

    const props = {
      params: { locale: 'az' },
      searchParams: { q: 'phone' },
    };

    // Render the async server component
    const SearchPageElement = await SearchPage(props);
    render(SearchPageElement);

    // Assert fetch call
    expect(fetchMock).toHaveBeenCalled();
    const callUrl = fetchMock.mock.calls[0][0];
    expect(callUrl).toContain('search=phone');

    // Assert translations and results
    expect(screen.getByText('product.search_results_with_query:phone')).toBeInTheDocument();
    expect(screen.getAllByTestId('product-filters').length).toBeGreaterThan(0);
    expect(screen.getByTestId('product-grid')).toBeInTheDocument();
    expect(screen.getByText('Product Grid: 2 items')).toBeInTheDocument();
    expect(screen.getByText('Product 1')).toBeInTheDocument();
    expect(screen.getByText('Product 2')).toBeInTheDocument();
  });

  it('renders error state when api fails', async () => {
    // Mock fetch to fail
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
    });
    global.fetch = fetchMock;

    const props = {
      params: { locale: 'az' },
      searchParams: { q: 'phone' },
    };

    const SearchPageElement = await SearchPage(props);
    render(SearchPageElement);

    expect(screen.getByText('product.products_load_error')).toBeInTheDocument();
    expect(screen.getByText('Product Grid: 0 items')).toBeInTheDocument();
  });

  it('renders search intro and search input when query is empty', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: { products: [] },
      }),
    });
    global.fetch = fetchMock;

    const props = {
      params: { locale: 'az' },
      searchParams: {},
    };

    const SearchPageElement = await SearchPage(props);
    render(SearchPageElement);

    expect(screen.getByText('product.search_page_title')).toBeInTheDocument();
    expect(screen.getByText('product.search_intro')).toBeInTheDocument();
  });

  it('generates correct metadata based on search query', async () => {
    const propsWithQuery = {
      params: { locale: 'az' },
      searchParams: { q: 'laptop' },
    };

    const metadataWithQuery = await generateMetadata(propsWithQuery);
    expect(metadataWithQuery.title).toContain('product.search_results_with_query:laptop');
    expect(metadataWithQuery.description).toContain('product.search_page_desc_with_query:laptop');

    const propsWithoutQuery = {
      params: { locale: 'az' },
      searchParams: {},
    };

    const metadataWithoutQuery = await generateMetadata(propsWithoutQuery);
    expect(metadataWithoutQuery.title).toContain('common.search_title');
    expect(metadataWithoutQuery.description).toContain('common.site_desc');
  });
});
