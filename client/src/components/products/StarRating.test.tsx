import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StarRating } from './StarRating';

describe('StarRating', () => {
  it('renders correct number of stars', () => {
    render(<StarRating rating={4} maxStars={5} />);
    const ratingContainer = screen.getByTestId('star-rating');
    expect(ratingContainer).toBeInTheDocument();
    
    // There should be 5 buttons (stars)
    const buttons = ratingContainer.querySelectorAll('button');
    expect(buttons.length).toBe(5);
  });

  it('renders interactive stars and calls onChange when clicked', () => {
    const handleChange = vi.fn();
    render(<StarRating rating={3} interactive onChange={handleChange} />);
    
    const ratingContainer = screen.getByTestId('star-rating');
    const buttons = ratingContainer.querySelectorAll('button');
    
    // Click the 4th star (index 3)
    fireEvent.click(buttons[3]);
    expect(handleChange).toHaveBeenCalledWith(4);
  });

  it('disables buttons when not interactive', () => {
    render(<StarRating rating={3} interactive={false} />);
    const ratingContainer = screen.getByTestId('star-rating');
    const buttons = ratingContainer.querySelectorAll('button');
    
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });
});
