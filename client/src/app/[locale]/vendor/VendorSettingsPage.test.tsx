import React from 'react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import VendorSettingsPage from './settings/page';
import { useMyVendor, useUpdateMyVendor, useUploadVendorLogo, useUploadVendorBanner } from '@/hooks/useVendor';

vi.mock('next-intl', () => ({
  useTranslations: (namespace?: string) => (key: string) => (namespace ? `${namespace}.${key}` : key),
}));

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock('@/hooks/useVendor', () => ({
  useMyVendor: vi.fn(),
  useUpdateMyVendor: vi.fn(),
  useUploadVendorLogo: vi.fn(),
  useUploadVendorBanner: vi.fn(),
}));

const vendor = {
  id: 'v1', storeName: 'Acme', slug: 'acme', description: 'desc', phone: '+994', address: 'Baku',
  logo: null, banner: null, status: 'APPROVED', commission: 10, totalSales: 500, productCount: 7,
};

const mutate = vi.fn();

describe('VendorSettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useMyVendor as Mock).mockReturnValue({ data: vendor, isLoading: false, isError: false, error: null, refetch: vi.fn() });
    (useUpdateMyVendor as Mock).mockReturnValue({ mutate, isPending: false });
    (useUploadVendorLogo as Mock).mockReturnValue({ mutate: vi.fn(), isPending: false });
    (useUploadVendorBanner as Mock).mockReturnValue({ mutate: vi.fn(), isPending: false });
  });

  it('renders the edit form seeded from the vendor profile plus read-only stats', () => {
    render(<VendorSettingsPage />);
    expect(screen.getByLabelText('vendor.store_name')).toHaveValue('Acme');
    expect(screen.getByLabelText('vendor.phone')).toHaveValue('+994');
    expect(screen.getByLabelText('vendor.address')).toHaveValue('Baku');
    // read-only stats
    expect(screen.getByText('acme')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('submits edited store details via the update mutation', () => {
    render(<VendorSettingsPage />);
    fireEvent.change(screen.getByLabelText('vendor.store_name'), { target: { value: 'Acme Corp' } });
    fireEvent.click(screen.getByRole('button', { name: 'vendor.save' }));
    expect(mutate).toHaveBeenCalledTimes(1);
    expect(mutate.mock.calls[0][0]).toMatchObject({ storeName: 'Acme Corp', address: 'Baku' });
  });

  it('shows the error state when the profile fails to load', () => {
    (useMyVendor as Mock).mockReturnValue({ data: undefined, isLoading: false, isError: true, error: new Error('x'), refetch: vi.fn() });
    render(<VendorSettingsPage />);
    expect(screen.getByTestId('error-state')).toBeInTheDocument();
  });
});
