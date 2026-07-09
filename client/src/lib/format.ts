// src/lib/format.ts
// Small, deterministic formatting helpers shared by the admin analytics UI.
// Kept locale-fixed (en-US grouping) so output is stable across environments
// and unit tests.

/** Format a monetary amount with grouping and 2 decimals, suffixed by `symbol`. */
export function formatCurrency(value: number | null | undefined, symbol = 'AZN'): string {
  const n = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value ?? 0);
  return `${n} ${symbol}`;
}

/** Format an integer-ish count with thousands grouping. */
export function formatNumber(value: number | null | undefined): string {
  return new Intl.NumberFormat('en-US').format(value ?? 0);
}

export type Granularity = 'day' | 'month' | 'year';

/**
 * Turn an ISO date/datetime string into a short axis label.
 * - `day`   → `DD.MM`
 * - `month` → `MM.YYYY`
 * - `year`  → `YYYY`
 *
 * Parses the leading `YYYY-MM-DD` directly (no Date object) so it is immune to
 * timezone drift. Returns the input unchanged if it is not ISO-shaped.
 */
export function formatAxisDate(iso: string, granularity: Granularity = 'day'): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!match) return iso;
  const [, year, month, day] = match;
  if (granularity === 'year') return year;
  if (granularity === 'month') return `${month}.${year}`;
  return `${day}.${month}`;
}
