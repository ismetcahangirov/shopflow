import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductImages } from './ProductImages';
import { ProductImage } from '@/types';

const makeImage = (id: string, url: string, isMain = false): ProductImage => ({
  id,
  url,
  alt: `Image ${id}`,
  isMain,
  sortOrder: 1,
});

const mockImages: ProductImage[] = [
  makeImage('img-1', 'https://example.com/img1.jpg', true),
  makeImage('img-2', 'https://example.com/img2.jpg'),
  makeImage('img-3', 'https://example.com/img3.jpg'),
];

describe('ProductImages', () => {
  it('renders placeholder when images array is empty', () => {
    render(<ProductImages images={[]} />);
    const img = document.querySelector('img') as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toContain('placeholder-product');
  });

  it('renders placeholder when images prop is not provided', () => {
    render(<ProductImages />);
    const img = document.querySelector('img') as HTMLImageElement;
    expect(img.src).toContain('placeholder-product');
  });

  it('renders main image correctly with multiple images', () => {
    render(<ProductImages images={mockImages} />);
    const mainContainer = screen.getByTestId('main-image-container');
    const mainImg = mainContainer.querySelector('img');
    expect(mainImg).toHaveAttribute('src', 'https://example.com/img1.jpg');
  });

  it('switches main image on thumbnail click', () => {
    render(<ProductImages images={mockImages} />);
    const mainContainer = screen.getByTestId('main-image-container');
    const mainImg = mainContainer.querySelector('img');

    fireEvent.click(screen.getByRole('button', { name: /select product image 2/i }));
    expect(mainImg).toHaveAttribute('src', 'https://example.com/img2.jpg');
  });

  it('does NOT show navigation buttons for a single image', () => {
    render(<ProductImages images={[makeImage('img-1', 'https://example.com/img1.jpg', true)]} />);
    expect(screen.queryByLabelText('Previous image')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Next image')).not.toBeInTheDocument();
  });

  it('does NOT show thumbnail strip for a single image', () => {
    render(<ProductImages images={[makeImage('img-1', 'https://example.com/img1.jpg', true)]} />);
    expect(screen.queryByRole('button', { name: /select product image/i })).not.toBeInTheDocument();
  });

  it('shows prev/next navigation buttons for multiple images', () => {
    render(<ProductImages images={mockImages} />);
    expect(screen.getByLabelText('Previous image')).toBeInTheDocument();
    expect(screen.getByLabelText('Next image')).toBeInTheDocument();
  });

  it('navigates to next image on next button click', () => {
    render(<ProductImages images={mockImages} />);
    const mainContainer = screen.getByTestId('main-image-container');
    const mainImg = mainContainer.querySelector('img');

    fireEvent.click(screen.getByLabelText('Next image'));
    expect(mainImg).toHaveAttribute('src', 'https://example.com/img2.jpg');
  });

  it('navigates to previous image on prev button click', () => {
    render(<ProductImages images={mockImages} />);
    const mainContainer = screen.getByTestId('main-image-container');
    const mainImg = mainContainer.querySelector('img');

    // Go to img2 first
    fireEvent.click(screen.getByLabelText('Next image'));
    expect(mainImg).toHaveAttribute('src', 'https://example.com/img2.jpg');

    // Then go back
    fireEvent.click(screen.getByLabelText('Previous image'));
    expect(mainImg).toHaveAttribute('src', 'https://example.com/img1.jpg');
  });

  it('wraps around to last image when pressing prev on first image', () => {
    render(<ProductImages images={mockImages} />);
    const mainContainer = screen.getByTestId('main-image-container');
    const mainImg = mainContainer.querySelector('img');

    fireEvent.click(screen.getByLabelText('Previous image'));
    expect(mainImg).toHaveAttribute('src', 'https://example.com/img3.jpg');
  });

  it('wraps around to first image when pressing next on last image', () => {
    render(<ProductImages images={mockImages} />);
    const mainContainer = screen.getByTestId('main-image-container');
    const mainImg = mainContainer.querySelector('img');

    fireEvent.click(screen.getByLabelText('Next image'));
    fireEvent.click(screen.getByLabelText('Next image'));
    expect(mainImg).toHaveAttribute('src', 'https://example.com/img3.jpg');

    fireEvent.click(screen.getByLabelText('Next image'));
    expect(mainImg).toHaveAttribute('src', 'https://example.com/img1.jpg');
  });

  it('toggles zoom class on mouse enter/leave', () => {
    render(<ProductImages images={mockImages} />);
    const mainContainer = screen.getByTestId('main-image-container');
    const mainImg = mainContainer.querySelector('img');

    fireEvent.mouseEnter(mainContainer);
    expect(mainImg).toHaveClass('scale-[2]');

    fireEvent.mouseLeave(mainContainer);
    expect(mainImg).not.toHaveClass('scale-[2]');
  });

  it('updates mouse position on mouseMove without throwing', () => {
    render(<ProductImages images={mockImages} />);
    const mainContainer = screen.getByTestId('main-image-container');
    fireEvent.mouseMove(mainContainer, { clientX: 100, clientY: 50 });
  });
});
