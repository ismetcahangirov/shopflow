import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductGrid } from './ProductGrid';
import { Product } from '@/types';

const mockProducts: Product[] = [
  {
    id: 'prod-1',
    slug: 'product-1',
    name: 'Product One',
    description: 'Test one',
    price: 50,
    comparePrice: null,
    stock: 5,
    avgRating: 4.0,
    reviewCount: 4,
    salesCount: 0,
    sku: 'sku-1',
    barcode: null,
    tags: [],
    isActive: true,
    brand: 'Brand A',
    categoryId: 'cat-1',
    vendorId: 'vendor-1',
    isFeatured: false,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    images: [],
    category: {
      id: 'cat-1',
      name: 'Category',
      slug: 'category',
    },
    vendor: {
      id: 'vendor-1',
      storeName: 'Vendor',
    },
    variants: [],
    attributes: [],
  },
  {
    id: 'prod-2',
    slug: 'product-2',
    name: 'Product Two',
    description: 'Test two',
    price: 150,
    comparePrice: 180,
    stock: 0,
    avgRating: 4.8,
    reviewCount: 20,
    salesCount: 0,
    sku: 'sku-2',
    barcode: null,
    tags: [],
    isActive: true,
    brand: 'Brand B',
    categoryId: 'cat-2',
    vendorId: 'vendor-1',
    isFeatured: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    images: [],
    category: {
      id: 'cat-2',
      name: 'Category 2',
      slug: 'category-2',
    },
    vendor: {
      id: 'vendor-1',
      storeName: 'Vendor',
    },
    variants: [],
    attributes: [],
  },
];

describe('ProductGrid', () => {
  it('renders loading skeleton when isLoading is true', () => {
    render(<ProductGrid isLoading products={[]} />);
    expect(screen.getByTestId('product-grid-skeleton')).toBeInTheDocument();
  });

  it('renders empty state when no products are provided', () => {
    render(<ProductGrid products={[]} />);
    expect(screen.getByTestId('product-grid-empty')).toBeInTheDocument();
    expect(screen.getByText('no_products_found')).toBeInTheDocument();
  });

  it('renders products when they are provided', () => {
    render(<ProductGrid products={mockProducts} />);
    const grid = screen.getByTestId('product-grid');
    expect(grid).toBeInTheDocument();
    expect(screen.getByText('Product One')).toBeInTheDocument();
    expect(screen.getByText('Product Two')).toBeInTheDocument();
  });
});
