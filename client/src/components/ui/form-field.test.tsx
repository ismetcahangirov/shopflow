// src/components/ui/form-field.test.tsx
// Tests for FormField: renders label, shows/hides error, shows hint

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormField } from './form-field';

describe('FormField', () => {
  it('renders label text', () => {
    render(<FormField label="Email" htmlFor="email" />);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('shows required asterisk when required prop is set', () => {
    render(<FormField label="Email" htmlFor="email" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('shows error message when error prop is provided', () => {
    render(<FormField label="Email" htmlFor="email" error="Email is required" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Email is required');
  });

  it('does not show error message when no error', () => {
    render(<FormField label="Email" htmlFor="email" />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows hint text when no error is present', () => {
    render(<FormField label="Password" htmlFor="password" hint="Min 8 characters" />);
    expect(screen.getByText('Min 8 characters')).toBeInTheDocument();
  });

  it('hides hint when error is shown', () => {
    render(
      <FormField
        label="Password"
        htmlFor="password"
        error="Too short"
        hint="Min 8 characters"
      />,
    );
    expect(screen.queryByText('Min 8 characters')).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Too short');
  });

  it('links label to input via htmlFor', () => {
    render(<FormField label="Username" htmlFor="username" />);
    const label = screen.getByText('Username');
    expect(label).toHaveAttribute('for', 'username');
  });

  it('marks input as aria-invalid when error is present', () => {
    render(<FormField label="Email" htmlFor="email-err" error="Invalid" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  // Regression: react-hook-form's register() passes a ref that must reach the
  // underlying <input>. If FormField is not wrapped in forwardRef, the ref is
  // lost and RHF cannot read the field value, breaking all auth forms.
  it('forwards ref to the underlying input element', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<FormField label="Email" htmlFor="email-ref" ref={ref} />);
    const input = screen.getByRole('textbox');
    expect(ref.current).toBe(input);
    expect(ref.current?.tagName).toBe('INPUT');
  });
});
