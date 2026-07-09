import { describe, it, expect } from 'vitest';
import { formatCurrency, formatNumber, formatAxisDate } from './format';

describe('formatCurrency', () => {
  it('formats with grouping, 2 decimals and default AZN symbol', () => {
    expect(formatCurrency(1234.5)).toBe('1,234.50 AZN');
    expect(formatCurrency(0)).toBe('0.00 AZN');
    expect(formatCurrency(1000000)).toBe('1,000,000.00 AZN');
  });

  it('accepts a custom currency symbol', () => {
    expect(formatCurrency(9.9, '$')).toBe('9.90 $');
  });

  it('treats null/undefined as zero', () => {
    expect(formatCurrency(null)).toBe('0.00 AZN');
    expect(formatCurrency(undefined)).toBe('0.00 AZN');
  });
});

describe('formatNumber', () => {
  it('formats integers with thousands grouping', () => {
    expect(formatNumber(1500)).toBe('1,500');
    expect(formatNumber(0)).toBe('0');
  });

  it('treats null/undefined as zero', () => {
    expect(formatNumber(null)).toBe('0');
    expect(formatNumber(undefined)).toBe('0');
  });
});

describe('formatAxisDate', () => {
  const iso = '2026-06-08T10:00:00.000Z';

  it('formats day granularity as DD.MM', () => {
    expect(formatAxisDate(iso, 'day')).toBe('08.06');
    expect(formatAxisDate(iso)).toBe('08.06');
  });

  it('formats month granularity as MM.YYYY', () => {
    expect(formatAxisDate(iso, 'month')).toBe('06.2026');
  });

  it('formats year granularity as YYYY', () => {
    expect(formatAxisDate(iso, 'year')).toBe('2026');
  });

  it('returns the input unchanged when not ISO-shaped', () => {
    expect(formatAxisDate('not-a-date', 'day')).toBe('not-a-date');
  });
});
