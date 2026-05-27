// src/components/ui/input.test.tsx
// Tests for Input component: render, password toggle, error state, icon

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from './input';
import { Mail } from 'lucide-react';

describe('Input', () => {
  it('renders with placeholder', () => {
    render(<Input placeholder="Test" />);
    expect(screen.getByPlaceholderText('Test')).toBeInTheDocument();
  });

  it('applies error styling when hasError is true', () => {
    render(<Input hasError placeholder="Error input" />);
    const input = screen.getByPlaceholderText('Error input');
    expect(input.className).toContain('border-red-400');
  });

  it('renders password toggle button for type="password"', () => {
    render(<Input type="password" placeholder="Password" />);
    const toggleBtn = screen.getByRole('button', { name: /show password/i });
    expect(toggleBtn).toBeInTheDocument();
  });

  it('toggles password visibility on button click', () => {
    render(<Input type="password" placeholder="Password" />);
    const input = screen.getByPlaceholderText('Password');
    const toggleBtn = screen.getByRole('button', { name: /show password/i });

    expect(input).toHaveAttribute('type', 'password');
    fireEvent.click(toggleBtn);
    expect(input).toHaveAttribute('type', 'text');
    fireEvent.click(screen.getByRole('button', { name: /hide password/i }));
    expect(input).toHaveAttribute('type', 'password');
  });

  it('renders leading icon when provided', () => {
    render(<Input leadingIcon={<Mail data-testid="mail-icon" />} placeholder="Email" />);
    expect(screen.getByTestId('mail-icon')).toBeInTheDocument();
    // Icon padding applied
    expect(screen.getByPlaceholderText('Email').className).toContain('pl-10');
  });

  it('forwards ref to input element', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} placeholder="Ref test" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('passes through onChange handler', () => {
    const onChange = vi.fn();
    render(<Input placeholder="Change test" onChange={onChange} />);
    fireEvent.change(screen.getByPlaceholderText('Change test'), { target: { value: 'hi' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is passed', () => {
    render(<Input disabled placeholder="Disabled" />);
    expect(screen.getByPlaceholderText('Disabled')).toBeDisabled();
  });
});
