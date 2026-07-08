// src/components/ui/theme-toggle.test.tsx
// Tests for ThemeToggle — verifies it flips between light and dark via next-themes

import React from 'react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useTheme } from 'next-themes';
import { ThemeToggle } from './theme-toggle';

vi.mock('next-themes', () => ({
  useTheme: vi.fn(),
}));

function mockTheme(resolvedTheme: string, setTheme = vi.fn()) {
  (useTheme as unknown as Mock).mockReturnValue({ resolvedTheme, setTheme });
  return setTheme;
}

describe('ThemeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders an accessible toggle button', () => {
    mockTheme('light');
    render(<ThemeToggle />);
    expect(screen.getByRole('button', { name: /toggle_theme/i })).toBeInTheDocument();
  });

  it('switches to dark when the current theme is light', () => {
    const setTheme = mockTheme('light');
    const { container } = render(<ThemeToggle />);

    // Light mode shows the Moon icon (the "switch to dark" affordance)
    expect(container.querySelector('.lucide-moon')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button'));
    expect(setTheme).toHaveBeenCalledWith('dark');
  });

  it('switches to light when the current theme is dark', () => {
    const setTheme = mockTheme('dark');
    const { container } = render(<ThemeToggle />);

    // Dark mode shows the Sun icon (the "switch to light" affordance)
    expect(container.querySelector('.lucide-sun')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button'));
    expect(setTheme).toHaveBeenCalledWith('light');
  });
});
