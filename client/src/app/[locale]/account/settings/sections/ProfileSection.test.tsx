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

const updateProfileMutate = vi.fn();
const updateAvatarMutate = vi.fn();

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

  it('uploads the selected avatar file', () => {
    render(<ProfileSection user={user} />);

    const file = new File(['x'], 'avatar.png', { type: 'image/png' });
    const input = screen.getByTestId('avatar-input') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    expect(updateAvatarMutate).toHaveBeenCalledWith(file, expect.any(Object));
  });
});
