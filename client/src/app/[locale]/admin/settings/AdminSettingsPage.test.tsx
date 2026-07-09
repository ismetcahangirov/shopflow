import React from 'react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { toast } from 'sonner';
import AdminSettingsPage from './page';
import { useSettings, useUpdateSettings } from '@/hooks/useSettings';

vi.mock('next-intl', () => ({
  useTranslations: (namespace?: string) => (key: string) =>
    namespace ? `${namespace}.${key}` : key,
}));

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock('@/hooks/useSettings', () => ({
  useSettings: vi.fn(),
  useUpdateSettings: vi.fn(),
  SETTINGS_KEYS: [
    'site_name',
    'site_email',
    'currency',
    'currency_symbol',
    'shipping_cost',
    'free_shipping_min',
    'tax_rate',
  ],
}));

const settings = {
  site_name: 'ShopFlow',
  site_email: 'info@shopflow.az',
  currency: 'AZN',
  currency_symbol: '₼',
  shipping_cost: '5',
  free_shipping_min: '100',
  tax_rate: '18',
};

describe('AdminSettingsPage', () => {
  const mutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mutateAsync.mockResolvedValue(undefined);
    (useSettings as Mock).mockReturnValue({
      data: settings,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
    (useUpdateSettings as Mock).mockReturnValue({ mutateAsync, isPending: false });
  });

  it('renders a loading skeleton while fetching', () => {
    (useSettings as Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
    render(<AdminSettingsPage />);
    expect(screen.queryByLabelText('admin_settings.field_site_name')).not.toBeInTheDocument();
  });

  it('renders the error state with a retry handler', () => {
    const refetch = vi.fn();
    (useSettings as Mock).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('nope'),
      refetch,
    });
    render(<AdminSettingsPage />);
    expect(screen.getByTestId('error-state')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Yenidən cəhd/i }));
    expect(refetch).toHaveBeenCalled();
  });

  it('seeds the general fields from the fetched settings', () => {
    render(<AdminSettingsPage />);
    expect(screen.getByLabelText('admin_settings.field_site_name')).toHaveValue('ShopFlow');
    expect(screen.getByLabelText('admin_settings.field_site_email')).toHaveValue(
      'info@shopflow.az',
    );
  });

  it('saves edited settings and shows a success toast', async () => {
    render(<AdminSettingsPage />);
    fireEvent.change(screen.getByLabelText('admin_settings.field_site_name'), {
      target: { value: 'New Name' },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /admin_settings.save/i }));
    });
    expect(mutateAsync).toHaveBeenCalledTimes(1);
    const payload = mutateAsync.mock.calls[0][0];
    expect(payload).toContainEqual({ key: 'site_name', value: 'New Name' });
    // All seeded fields are non-empty, so all 7 are sent.
    expect(payload).toHaveLength(7);
    expect(toast.success).toHaveBeenCalledWith('admin_settings.save_success');
  });

  it('omits emptied fields from the payload', async () => {
    render(<AdminSettingsPage />);
    fireEvent.change(screen.getByLabelText('admin_settings.field_site_email'), {
      target: { value: '' },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /admin_settings.save/i }));
    });
    const payload = mutateAsync.mock.calls[0][0] as { key: string }[];
    expect(payload.some((p) => p.key === 'site_email')).toBe(false);
    expect(payload).toHaveLength(6);
  });

  it('handles a partial API response (missing keys) without crashing on save', async () => {
    // The live API only returns the keys that exist in the DB.
    (useSettings as Mock).mockReturnValue({
      data: {
        site_name: 'ShopFlow',
        currency: 'AZN',
        currency_symbol: '₼',
        shipping_cost: '5',
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
    render(<AdminSettingsPage />);
    // A present-but-untouched field still shows its seeded value (no crash).
    expect(screen.getByLabelText('admin_settings.field_site_name')).toHaveValue('ShopFlow');
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /admin_settings.save/i }));
    });
    const payload = mutateAsync.mock.calls[0][0] as { key: string }[];
    // Only the 4 present, non-empty fields are sent.
    expect(payload).toHaveLength(4);
    expect(payload.some((p) => p.key === 'tax_rate')).toBe(false);
    expect(toast.success).toHaveBeenCalled();
  });

  it('shows an error toast when the save fails', async () => {
    mutateAsync.mockRejectedValueOnce(new Error('save failed'));
    render(<AdminSettingsPage />);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /admin_settings.save/i }));
    });
    expect(toast.error).toHaveBeenCalled();
  });
});
