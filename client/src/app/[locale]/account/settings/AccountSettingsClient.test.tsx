// Component tests for AccountSettingsClient: loading / error / loaded composition
// and the Google-only security branch.

import React from 'react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AccountSettingsClient from './AccountSettingsClient';
import {
  useMe,
  useUpdateProfile,
  useUpdatePassword,
  useUpdateAvatar,
  type UserProfile,
} from '@/hooks/useUser';

vi.mock('@/hooks/useUser', () => ({
  useMe: vi.fn(),
  useUpdateProfile: vi.fn(),
  useUpdatePassword: vi.fn(),
  useUpdateAvatar: vi.fn(),
}));

// The address manager owns its own data-fetching; stub it so this suite stays
// focused on the settings composition.
vi.mock('@/app/[locale]/(shop)/profile/addresses/AddressListClient', () => ({
  default: () => <div data-testid="address-manager" />,
}));

const user: UserProfile = {
  id: 'u1',
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  role: 'CUSTOMER',
  avatar: null,
  isVerified: true,
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  hasPassword: true,
};

function setMe(value: Record<string, unknown>) {
  (useMe as unknown as Mock).mockReturnValue(value);
}

beforeEach(() => {
  vi.clearAllMocks();
  const idleMutation = { mutate: vi.fn(), isPending: false, isError: false, error: null };
  (useUpdateProfile as unknown as Mock).mockReturnValue(idleMutation);
  (useUpdatePassword as unknown as Mock).mockReturnValue(idleMutation);
  (useUpdateAvatar as unknown as Mock).mockReturnValue(idleMutation);
  setMe({ data: user, isLoading: false, isError: false, error: null, refetch: vi.fn() });
});

describe('AccountSettingsClient', () => {
  it('shows a loading skeleton while the profile query is loading', () => {
    setMe({ data: undefined, isLoading: true, isError: false, error: null, refetch: vi.fn() });

    render(<AccountSettingsClient />);

    expect(screen.getAllByTestId('skeleton-pulse').length).toBeGreaterThan(0);
  });

  it('shows an error state with a retry button when the query fails', () => {
    const refetch = vi.fn();
    setMe({ data: undefined, isLoading: false, isError: true, error: new Error('boom'), refetch });

    render(<AccountSettingsClient />);

    expect(screen.getByTestId('error-state')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /yenidən/i }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('renders all settings sections when the profile resolves', () => {
    render(<AccountSettingsClient />);

    expect(screen.getByRole('heading', { level: 1, name: 'settings_title' })).toBeInTheDocument();
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'change_password_btn' })).toBeInTheDocument();
    expect(screen.getByTestId('address-manager')).toBeInTheDocument();
    expect(screen.getByText('language')).toBeInTheDocument();
  });

  it('shows the Google-managed notice instead of a password form for passwordless accounts', () => {
    setMe({ data: { ...user, hasPassword: false }, isLoading: false, isError: false, error: null, refetch: vi.fn() });

    render(<AccountSettingsClient />);

    expect(screen.getByTestId('security-google-notice')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'change_password_btn' })).not.toBeInTheDocument();
  });
});
