// src/components/layout/Breadcrumb.test.tsx
// Render tests for Breadcrumb layout component

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Breadcrumb } from './Breadcrumb';

describe('Breadcrumb Component', () => {
  it('renders default home link and items', () => {
    const items = [
      { label: 'Kateqoriyalar', href: '/categories' },
      { label: 'Geyim' },
    ];

    render(<Breadcrumb items={items} />);

    // Check if default "Ana səhifə" is rendered
    expect(screen.getByText('Ana səhifə')).toBeInTheDocument();
    
    // Check if custom items are rendered
    expect(screen.getByText('Kateqoriyalar')).toBeInTheDocument();
    expect(screen.getByText('Geyim')).toBeInTheDocument();
  });

  it('renders links for items with href', () => {
    const items = [
      { label: 'Profil', href: '/profile' },
      { label: 'Sifarişlər' },
    ];

    render(<Breadcrumb items={items} />);

    const homeLink = screen.getByText('Ana səhifə').closest('a');
    expect(homeLink).toHaveAttribute('href', '/az');

    const profileLink = screen.getByText('Profil').closest('a');
    expect(profileLink).toHaveAttribute('href', '/az/profile');

    // Last item should not be a link
    const lastItem = screen.getByText('Sifarişlər');
    expect(lastItem.closest('a')).toBeNull();
  });

  it('adds JSON-LD schema markup script to DOM', () => {
    const items = [
      { label: 'Məhsul', href: '/products/1' },
    ];

    const { container } = render(<Breadcrumb items={items} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    
    expect(script).toBeInTheDocument();
    expect(script?.innerHTML).toContain('BreadcrumbList');
    expect(script?.innerHTML).toContain('Ana səhifə');
    expect(script?.innerHTML).toContain('Məhsul');
  });
});
