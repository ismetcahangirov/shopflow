import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductDetailClient } from './ProductDetailClient';
import type { Product } from '@/types';

vi.mock('@/components/reviews/ProductReviewSection', () => ({
  ProductReviewSection: () => <div data-testid="mock-product-reviews" />,
}));


const mockProduct: Product = {
  id: 'prod-1',
  slug: 'test-product',
  name: 'Premium Leather Bag',
  description: '<p>A premium high-quality leather bag.</p>',
  shortDesc: 'Short description for the premium bag.',
  price: 150,
  comparePrice: 200,
  stock: 5,
  avgRating: 4.8,
  reviewCount: 25,
  salesCount: 10,
  sku: 'BG-LTHR-01',
  barcode: null,
  tags: ['leather', 'bag', 'premium'],
  isActive: true,
  brand: 'LeatherCo',
  categoryId: 'cat-1',
  vendorId: 'vendor-1',
  isFeatured: true,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  images: [
    {
      id: 'img-1',
      url: 'https://example.com/bag1.jpg',
      alt: 'Bag Front',
      isMain: true,
      sortOrder: 1,
    },
    {
      id: 'img-2',
      url: 'https://example.com/bag2.jpg',
      alt: 'Bag Side',
      isMain: false,
      sortOrder: 2,
    },
  ],
  category: {
    id: 'cat-1',
    name: 'Bags',
    slug: 'bags',
  },
  vendor: {
    id: 'vendor-1',
    storeName: 'Leather Co Store',
  },
  variants: [
    {
      id: 'var-black',
      name: 'Black',
      price: 150,
      stock: 5,
      sku: 'BG-LTHR-01-BLK',
    },
    {
      id: 'var-brown',
      name: 'Brown',
      price: 160,
      stock: 0,
      sku: 'BG-LTHR-01-BRW',
    },
  ],
  attributes: [
    {
      id: 'attr-1',
      name: 'Material',
      value: '100% Genuine Leather',
    },
  ],
};

describe('ProductDetailClient', () => {
  it('renders product information correctly', () => {
    render(<ProductDetailClient product={mockProduct} locale="az" />);

    expect(screen.getByText('Premium Leather Bag')).toBeInTheDocument();
    expect(screen.getByText('LeatherCo')).toBeInTheDocument();
    expect(screen.getByText('150.00 ₼')).toBeInTheDocument();
    expect(screen.getByText('200.00 ₼')).toBeInTheDocument();
    expect(screen.getByText('-25%')).toBeInTheDocument(); // Math.round(((200-150)/200)*100) = 25%
    expect(screen.getByText('in_stock — 5 ədəd')).toBeInTheDocument();
    expect(screen.getByText('Material:')).toBeInTheDocument();
    expect(screen.getByText('100% Genuine Leather')).toBeInTheDocument();
    expect(screen.getByText('A premium high-quality leather bag.')).toBeInTheDocument();
  });

  it('handles quantity increase and decrease boundaries', () => {
    render(<ProductDetailClient product={mockProduct} locale="az" />);

    const decBtn = screen.getByRole('button', { name: '−' });
    const incBtn = screen.getByRole('button', { name: '+' });
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(decBtn).toBeDisabled();

    // Increase within stock limit (5)
    fireEvent.click(incBtn);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(decBtn).not.toBeDisabled();

    fireEvent.click(incBtn);
    fireEvent.click(incBtn);
    fireEvent.click(incBtn); // now 5
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(incBtn).toBeDisabled();

    // Decrease
    fireEvent.click(decBtn);
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('switches variant and updates prices/stock details accordingly', () => {
    render(<ProductDetailClient product={mockProduct} locale="az" />);

    // Default variant selected is Black (price: 150)
    expect(screen.getByText('150.00 ₼')).toBeInTheDocument();

    // Brown variant is out of stock (stock: 0) and disabled/styled differently
    const brownBtn = screen.getByRole('button', { name: /Brown/i });
    expect(brownBtn).toBeDisabled();
  });

  it('renders out of stock UI and disables buttons when product has no stock', () => {
    const outOfStockProduct = {
      ...mockProduct,
      stock: 0,
      variants: [],
    };
    render(<ProductDetailClient product={outOfStockProduct} locale="az" />);

    expect(screen.getAllByText('out_of_stock')[0]).toBeInTheDocument();
    expect(screen.getAllByText('out_of_stock').length).toBe(2);
    expect(screen.getByRole('button', { name: /add_to_cart/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /buy_now/i })).toBeDisabled();
  });
});
