import { describe, it, expect, vi } from 'vitest';
import { createTranslator } from 'next-intl';
import { routing } from './routing';

// The global test setup (src/test/setup.ts) mocks next-intl so useTranslations
// returns the key itself — the very reason raw keys were never caught. Use the
// real module here so translations actually resolve.
vi.mock('next-intl', async (importOriginal) =>
  importOriginal<typeof import('next-intl')>()
);
import azMessages from '../../messages/az.json';
import enMessages from '../../messages/en.json';
import ruMessages from '../../messages/ru.json';

const allMessages: Record<string, Record<string, unknown>> = {
  az: azMessages,
  en: enMessages,
  ru: ruMessages,
};

// Regression guard for issue #52: raw i18n keys (product.above_rating,
// product.try_adjusting_filters) leaked to the UI because they were referenced
// in components but absent from the message files. next-intl renders the raw
// key path for a missing key, so the || fallbacks in the JSX never fired.
//
// Unlike the component tests, this suite loads the REAL message files so a
// missing key fails here instead of silently reaching users.

const productNamespaces: Record<string, Record<string, string>> = {
  az: azMessages.product as Record<string, string>,
  en: enMessages.product as Record<string, string>,
  ru: ruMessages.product as Record<string, string>,
};

// Keys that components reference but that are easy to forget in translations.
const requiredProductKeys = ['above_rating', 'try_adjusting_filters'];

describe('product namespace i18n keys (issue #52)', () => {
  it('covers every configured locale', () => {
    for (const locale of routing.locales) {
      expect(productNamespaces[locale], `missing fixture for ${locale}`).toBeDefined();
    }
  });

  for (const locale of routing.locales) {
    describe(`locale: ${locale}`, () => {
      const product = productNamespaces[locale];

      it.each(requiredProductKeys)('defines a non-empty product.%s', (key) => {
        const value = product[key];
        expect(typeof value).toBe('string');
        expect(value.trim().length).toBeGreaterThan(0);
      });

      it('renders above_rating via {count} interpolation, not a hardcoded number', () => {
        expect(product.above_rating).toContain('{count}');
      });

      // Reproduce exactly what the components render (same t() calls as
      // ProductFilters/ProductGrid) to prove no raw key path reaches the UI.
      it('renders resolved strings, never the raw key path', () => {
        const t = createTranslator({
          locale,
          messages: allMessages[locale],
          namespace: 'product',
        });

        const aboveRating = t('above_rating', { count: 4 });
        expect(aboveRating).toContain('4');
        expect(aboveRating).not.toContain('above_rating');
        expect(aboveRating).not.toContain('{count}');

        const emptyText = t('try_adjusting_filters');
        expect(emptyText).not.toContain('try_adjusting_filters');
        expect(emptyText.length).toBeGreaterThan(10);
      });
    });
  }
});
