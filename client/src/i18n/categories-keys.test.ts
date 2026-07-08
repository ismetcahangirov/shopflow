import { describe, it, expect } from 'vitest';
import { routing } from './routing';
import azMessages from '../../messages/az.json';
import enMessages from '../../messages/en.json';
import ruMessages from '../../messages/ru.json';

// Issue #51: the /categories index page renders these common keys. A missing
// key in any locale would leak the raw key path to users (cf. issue #52), so
// guard them across every configured locale using the REAL message files.
const commons: Record<string, Record<string, string>> = {
  az: azMessages.common as Record<string, string>,
  en: enMessages.common as Record<string, string>,
  ru: ruMessages.common as Record<string, string>,
};

const requiredKeys = ['categories_subtitle', 'categories_empty', 'products_count'];

describe('categories i18n keys (issue #51)', () => {
  it('covers every configured locale', () => {
    for (const locale of routing.locales) {
      expect(commons[locale], `missing common fixture for ${locale}`).toBeDefined();
    }
  });

  for (const locale of routing.locales) {
    describe(`locale: ${locale}`, () => {
      const common = commons[locale];

      it.each(requiredKeys)('defines a non-empty common.%s', (key) => {
        expect(typeof common[key]).toBe('string');
        expect(common[key].trim().length).toBeGreaterThan(0);
      });

      it('exposes products_count with a {count} placeholder for interpolation', () => {
        expect(common.products_count).toContain('{count}');
      });
    });
  }
});
