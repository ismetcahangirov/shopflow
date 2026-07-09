// Component tests for SecuritySection: Google-only guard, mismatch validation, submit payload.

import React from 'react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SecuritySection } from './SecuritySection';
import { useUpdatePassword } from '@/hooks/useUser';

vi.mock('@/hooks/useUser', () => ({
  useUpdatePassword: vi.fn(),
}));

// Invoke the success callback so the component's onSuccess branch runs.
const mutate = vi.fn((_payload, opts?: { onSuccess?: () => void }) => opts?.onSuccess?.());

beforeEach(() => {
  vi.clearAllMocks();
  (useUpdatePassword as unknown as Mock).mockReturnValue({
    mutate,
    isPending: false,
    isError: false,
    error: null,
  });
});

function openForm() {
  fireEvent.click(screen.getByRole('button', { name: 'change_password_btn' }));
}

describe('SecuritySection', () => {
  it('shows a Google-managed notice and no password form for accounts without a password', () => {
    render(<SecuritySection hasPassword={false} />);

    expect(screen.getByTestId('security-google-notice')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'change_password_btn' })).not.toBeInTheDocument();
  });

  it('reveals the password form when the change-password button is clicked', () => {
    render(<SecuritySection hasPassword={true} />);

    expect(screen.queryByLabelText(/current_password/)).not.toBeInTheDocument();
    openForm();
    expect(screen.getByLabelText(/current_password/)).toBeInTheDocument();
  });

  it('blocks submit and shows a mismatch message when new and confirm differ', () => {
    render(<SecuritySection hasPassword={true} />);
    openForm();

    fireEvent.change(screen.getByLabelText(/current_password/), { target: { value: 'oldpass12' } });
    fireEvent.change(screen.getByLabelText(/new_password/), { target: { value: 'newpass123' } });
    fireEvent.change(screen.getByLabelText(/confirm_password/), { target: { value: 'different123' } });
    fireEvent.click(screen.getByRole('button', { name: 'save' }));

    expect(screen.getByText('password_mismatch')).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('submits the password payload when new and confirm match', () => {
    render(<SecuritySection hasPassword={true} />);
    openForm();

    fireEvent.change(screen.getByLabelText(/current_password/), { target: { value: 'oldpass12' } });
    fireEvent.change(screen.getByLabelText(/new_password/), { target: { value: 'newpass123' } });
    fireEvent.change(screen.getByLabelText(/confirm_password/), { target: { value: 'newpass123' } });
    fireEvent.click(screen.getByRole('button', { name: 'save' }));

    expect(mutate).toHaveBeenCalledWith(
      { currentPassword: 'oldpass12', newPassword: 'newpass123', confirmPassword: 'newpass123' },
      expect.any(Object),
    );
  });

  it('collapses the form and shows a success message after a successful change', () => {
    render(<SecuritySection hasPassword={true} />);
    openForm();

    fireEvent.change(screen.getByLabelText(/current_password/), { target: { value: 'oldpass12' } });
    fireEvent.change(screen.getByLabelText(/new_password/), { target: { value: 'newpass123' } });
    fireEvent.change(screen.getByLabelText(/confirm_password/), { target: { value: 'newpass123' } });
    fireEvent.click(screen.getByRole('button', { name: 'save' }));

    expect(screen.getByText('password_updated')).toBeInTheDocument();
    expect(screen.queryByLabelText(/current_password/)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'change_password_btn' })).toBeInTheDocument();
  });

  it('closes the form without submitting when cancel is clicked', () => {
    render(<SecuritySection hasPassword={true} />);
    openForm();
    fireEvent.change(screen.getByLabelText(/current_password/), { target: { value: 'oldpass12' } });

    fireEvent.click(screen.getByRole('button', { name: 'cancel' }));

    expect(screen.queryByLabelText(/current_password/)).not.toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'change_password_btn' })).toBeInTheDocument();
  });
});
