// Component tests for ProfileSection: display, profile edit submit, avatar upload.

import React from 'react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProfileSection } from './ProfileSection';
import { useUpdateProfile, useUpdateAvatar, type UserProfile } from '@/hooks/useUser';

vi.mock('@/hooks/useUser', () => ({
  useUpdateProfile: vi.fn(),
  useUpdateAvatar: vi.fn(),
}));

// Invoke the success callback so the component's onSuccess branches run.
const updateProfileMutate = vi.fn((_payload, opts?: { onSuccess?: () => void }) => opts?.onSuccess?.());
const updateAvatarMutate = vi.fn((_file, opts?: { onSuccess?: () => void }) => opts?.onSuccess?.());

const user: UserProfile = {
  id: 'u1',
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  role: 'CUSTOMER',
  avatar: null,
  isVerified: true,
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
};

beforeEach(() => {
  vi.clearAllMocks();
  (useUpdateProfile as unknown as Mock).mockReturnValue({ mutate: updateProfileMutate, isPending: false, isError: false, error: null });
  (useUpdateAvatar as unknown as Mock).mockReturnValue({ mutate: updateAvatarMutate, isPending: false, isError: false, error: null });
});

describe('ProfileSection', () => {
  it('renders the user name, email and role badge', () => {
    render(<ProfileSection user={user} />);

    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('ada@example.com')).toBeInTheDocument();
    expect(screen.getByText('customer')).toBeInTheDocument();
    expect(screen.getByText('verified')).toBeInTheDocument();
  });

  it('submits updated name and email when the profile form is saved', () => {
    render(<ProfileSection user={user} />);

    fireEvent.click(screen.getByRole('button', { name: 'edit_profile' }));
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Grace Hopper' } });
    fireEvent.click(screen.getByRole('button', { name: 'save' }));

    expect(updateProfileMutate).toHaveBeenCalledWith(
      { name: 'Grace Hopper', email: 'ada@example.com' },
      expect.any(Object),
    );
  });

  it('shows a success message after saving the profile', () => {
    render(<ProfileSection user={user} />);

    fireEvent.click(screen.getByRole('button', { name: 'edit_profile' }));
    fireEvent.click(screen.getByRole('button', { name: 'save' }));

    expect(screen.getByText('profile_updated')).toBeInTheDocument();
    // Form collapses back to the edit button after a successful save.
    expect(screen.getByRole('button', { name: 'edit_profile' })).toBeInTheDocument();
  });

  it('exits edit mode when cancel is clicked without saving', () => {
    render(<ProfileSection user={user} />);

    fireEvent.click(screen.getByRole('button', { name: 'edit_profile' }));
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'cancel' }));

    expect(screen.queryByLabelText(/name/i)).not.toBeInTheDocument();
    expect(updateProfileMutate).not.toHaveBeenCalled();
  });

  it('uploads the selected avatar file and shows a success message', () => {
    render(<ProfileSection user={user} />);

    // Trigger the hidden file input via its button (covers the click handler).
    fireEvent.click(screen.getByRole('button', { name: 'change_avatar' }));

    const file = new File(['x'], 'avatar.png', { type: 'image/png' });
    const input = screen.getByTestId('avatar-input') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    expect(updateAvatarMutate).toHaveBeenCalledWith(file, expect.any(Object));
    expect(screen.getByText('avatar_updated')).toBeInTheDocument();
  });
});
