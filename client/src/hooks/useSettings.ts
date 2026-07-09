// src/hooks/useSettings.ts
// Global site settings — read (public) via GET /settings, update (ADMIN) via
// PUT /settings. Only the keys the backend supports are modelled here.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ApiResponse } from '@/types';

/** The exact set of setting keys supported by the backend settingsController. */
export const SETTINGS_KEYS = [
  'site_name',
  'site_email',
  'currency',
  'currency_symbol',
  'shipping_cost',
  'free_shipping_min',
  'tax_rate',
] as const;

export type SettingsKey = (typeof SETTINGS_KEYS)[number];

/**
 * All settings are stored and returned as strings by the API. Keys are optional
 * because the backend only returns the rows that actually exist in the DB (a
 * fresh install may be missing some).
 */
export type SiteSettings = Partial<Record<SettingsKey, string>>;

export function useSettings() {
  return useQuery<SiteSettings>({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<SiteSettings>>('/settings');
      return res.data.data;
    },
  });
}

/** The PUT /settings payload: an array of `{ key, value }` pairs. */
export type UpdateSettingsPayload = { key: SettingsKey; value: string }[];

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, UpdateSettingsPayload>({
    mutationFn: async (settings) => {
      await api.put('/settings', { settings });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}
