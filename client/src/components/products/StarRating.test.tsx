import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StarRating } from './StarRating';

describe('StarRating', () => {
  it('renders the correct number of star buttons', () => {
    render(<StarRating rating={4} maxStars={5} />);
    const stars = screen.getByTestId('star-rating').querySelectorAll('button');
    expect(stars.length).toBe(5);
  });

  it('respects a custom maxStars value', () => {
    render(<StarRating rating={3} maxStars={10} />);
    const stars = screen.getByTestId('star-rating').querySelectorAll('button');
    expect(stars.length).toBe(10);
  });

  it('renders interactive stars and calls onChange when clicked', () => {
    const handleChange = vi.fn();
    render(<StarRating rating={3} interactive onChange={handleChange} />);

    const buttons = screen.getByTestId('star-rating').querySelectorAll('button');
    fireEvent.click(buttons[3]); // 4th star → value 4
    expect(handleChange).toHaveBeenCalledWith(4);
  });

  it('disables all buttons when not interactive', () => {
    render(<StarRating rating={3} interactive={false} />);
    const buttons = screen.getByTestId('star-rating').querySelectorAll('button');
    buttons.forEach((btn) => expect(btn).toBeDisabled());
  });

  it('does not call onChange when clicking in display-only mode', () => {
    const handleChange = vi.fn();
    render(<StarRating rating={3} interactive={false} onChange={handleChange} />);

    const buttons = screen.getByTestId('star-rating').querySelectorAll('button');
    fireEvent.click(buttons[0]);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('does not throw when interactive has no onChange handler', () => {
    render(<StarRating rating={3} interactive />);
    const buttons = screen.getByTestId('star-rating').querySelectorAll('button');
    fireEvent.click(buttons[0]);
  });

  it('sets hover rating on mouseEnter in interactive mode', () => {
    render(<StarRating rating={2} interactive />);
    const buttons = screen.getByTestId('star-rating').querySelectorAll('button');
    fireEvent.mouseEnter(buttons[4]);
    expect(screen.getByLabelText('Rate 5 stars out of 5')).toBeInTheDocument();
  });

  it('clears hover rating on mouseLeave from the container', () => {
    const handleChange = vi.fn();
    render(<StarRating rating={2} interactive onChange={handleChange} />);
    const container = screen.getByTestId('star-rating');
    const buttons = container.querySelectorAll('button');

    fireEvent.mouseEnter(buttons[4]);
    fireEvent.mouseLeave(container);

    fireEvent.click(buttons[0]);
    expect(handleChange).toHaveBeenCalledWith(1);
  });

  it('does not update hover when not interactive (mouseEnter no-op)', () => {
    render(<StarRating rating={2} interactive={false} />);
    const buttons = screen.getByTestId('star-rating').querySelectorAll('button');
    fireEvent.mouseEnter(buttons[4]);
    fireEvent.mouseLeave(screen.getByTestId('star-rating'));
  });

  it('renders half star for fractional ratings (e.g. 2.5)', () => {
    const { container } = render(<StarRating rating={2.5} interactive={false} />);
    const halfOverlay = container.querySelector('.absolute.top-0.left-0.overflow-hidden');
    expect(halfOverlay).toBeInTheDocument();
  });

  it('applies sm size class when size="sm"', () => {
    const { container } = render(<StarRating rating={3} size="sm" />);
    expect(container.querySelector('.w-3\\.5')).toBeInTheDocument();
  });

  it('applies lg size class when size="lg"', () => {
    const { container } = render(<StarRating rating={3} size="lg" />);
    expect(container.querySelector('.w-6')).toBeInTheDocument();
  });

  it('applies custom className to the container', () => {
    render(<StarRating rating={3} className="my-custom-class" />);
    expect(screen.getByTestId('star-rating')).toHaveClass('my-custom-class');
  });
});
