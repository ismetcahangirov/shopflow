import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ProductSchema } from './ProductSchema';
import { Product } from '@/types';

const mockProduct: Product = {
  id: 'prod-1',
  slug: 'test-product',
  name: 'Test SEO Product',
  description: 'A great product for search engine spiders.',
  price: 99.99,
  comparePrice: null,
  stock: 12,
  avgRating: 4.8,
  reviewCount: 25,
  salesCount: 0,
  sku: 'SF-prod-1',
  barcode: null,
  tags: [],
  isActive: true,
  brand: 'SeoBrand',
  categoryId: 'cat-1',
  vendorId: 'vendor-1',
  isFeatured: false,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  images: [
    {
      id: 'img-1',
      url: 'https://example.com/main.jpg',
      alt: 'Test SEO Product Image',
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
    storeName: 'Vendor Store',
  },
  variants: [],
  attributes: [],
};

describe('ProductSchema', () => {
  it('correctly constructs and injects JSON-LD script', () => {
    const { container } = render(<ProductSchema product={mockProduct} />);
    const scriptTag = container.querySelector('script');
    
    expect(scriptTag).toBeInTheDocument();
    expect(scriptTag).toHaveAttribute('type', 'application/ld+json');
    
    const parsedData = JSON.parse(scriptTag?.textContent || '{}');
    expect(parsedData['@context']).toBe('https://schema.org');
    expect(parsedData['@type']).toBe('Product');
    expect(parsedData.name).toBe('Test SEO Product');
    expect(parsedData.sku).toBe('SF-prod-1');
    expect(parsedData.brand.name).toBe('SeoBrand');
    expect(parsedData.offers.price).toBe('99.99');
    expect(parsedData.offers.availability).toBe('https://schema.org/InStock');
    expect(parsedData.aggregateRating.ratingValue).toBe('4.8');
    expect(parsedData.aggregateRating.reviewCount).toBe('25');
  });
});
