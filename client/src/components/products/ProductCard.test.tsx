import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductCard } from './ProductCard';
import { Product } from '@/types';

const mockProduct: Product = {
  id: 'prod-1',
  slug: 'test-product',
  name: 'Test Product Name',
  description: 'Test description',
  price: 100,
  comparePrice: 120,
  stock: 10,
  avgRating: 4.5,
  reviewCount: 12,
  salesCount: 0,
  sku: 'sku-1',
  barcode: null,
  tags: [],
  isActive: true,
  brand: 'Test Brand',
  categoryId: 'cat-1',
  vendorId: 'vendor-1',
  isFeatured: true,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  images: [
    {
      id: 'img-1',
      url: 'https://example.com/image.jpg',
      alt: 'Test Product Image',
      isMain: true,
      sortOrder: 1,
    },
  ],
  category: {
    id: 'cat-1',
    name: 'Electronics',
    slug: 'electronics',
  },
  vendor: {
    id: 'vendor-1',
    storeName: 'Test Vendor Store',
  },
  variants: [],
  attributes: [],
};

describe('ProductCard', () => {
  it('renders product details correctly', () => {
    render(<ProductCard product={mockProduct} />);

    expect(screen.getByText('Test Product Name')).toBeInTheDocument();
    expect(screen.getByText('Test Brand')).toBeInTheDocument();
    expect(screen.getByText('₼100.00')).toBeInTheDocument();
    expect(screen.getByText('₼120.00')).toBeInTheDocument();
    expect(screen.getByText('-17%')).toBeInTheDocument(); // Math.round(((120-100)/120)*100) = 17%
  });

  it('renders featured badge if isFeatured is true', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('featured_badge')).toBeInTheDocument();
  });

  it('renders out of stock status if stock is 0', () => {
    const outOfStockProduct = { ...mockProduct, stock: 0 };
    render(<ProductCard product={outOfStockProduct} />);
    expect(screen.getByText('out_of_stock')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add_to_cart/i })).toBeDisabled();
  });
});
