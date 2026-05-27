import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductImages } from './ProductImages';
import { ProductImage } from '@/types';

const mockImages: ProductImage[] = [
  {
    id: 'img-1',
    url: 'https://example.com/img1.jpg',
    alt: 'Product Image 1',
    isMain: true,
    sortOrder: 1,
  },
  {
    id: 'img-2',
    url: 'https://example.com/img2.jpg',
    alt: 'Product Image 2',
    isMain: false,
    sortOrder: 2,
  },
];

describe('ProductImages', () => {
  it('renders correctly with multiple images and supports thumbnail click switching', () => {
    render(<ProductImages images={mockImages} />);

    // Renders the main image view
    const mainContainer = screen.getByTestId('main-image-container');
    expect(mainContainer).toBeInTheDocument();

    const mainImg = mainContainer.querySelector('img');
    expect(mainImg).toHaveAttribute('src', 'https://example.com/img1.jpg');

    // Click the second thumbnail
    const thumbButton = screen.getByRole('button', { name: /select product image 2/i });
    fireEvent.click(thumbButton);

    // Verify main image changed to img2
    expect(mainImg).toHaveAttribute('src', 'https://example.com/img2.jpg');
  });

  it('triggers zoom class scaling on hover', () => {
    render(<ProductImages images={mockImages} />);
    const mainContainer = screen.getByTestId('main-image-container');
    const mainImg = mainContainer.querySelector('img');

    // Hover mouse over image container to zoom in
    fireEvent.mouseEnter(mainContainer);
    expect(mainImg).toHaveClass('scale-[2]');

    // Hover mouse out to zoom back
    fireEvent.mouseLeave(mainContainer);
    expect(mainImg).not.toHaveClass('scale-[2]');
  });
});
