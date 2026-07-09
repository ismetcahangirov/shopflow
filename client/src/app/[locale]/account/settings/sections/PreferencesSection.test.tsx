// Component tests for PreferencesSection: renders language + theme controls.

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PreferencesSection } from './PreferencesSection';

describe('PreferencesSection', () => {
  it('renders language and theme labels with their controls', () => {
    render(<PreferencesSection />);

    expect(screen.getByText('language')).toBeInTheDocument();
    expect(screen.getByText('theme')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /change language/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'toggle_theme' })).toBeInTheDocument();
  });
});
