import { describe, it, expect } from 'vitest';
import { routing } from './routing';
import azMessages from '../../messages/az.json';
import enMessages from '../../messages/en.json';
import ruMessages from '../../messages/ru.json';

// Issue #53: the localized landing page ((shop)/page.tsx + HomeFeaturedProducts)
// moved every hardcoded Azerbaijani string into the `home` namespace. A key
// missing from any locale leaks the raw key path to users (cf. issue #52), so
// guard the full set across every configured locale using the REAL message files.

const homeNamespaces: Record<string, Record<string, string>> = {
  az: azMessages.home as Record<string, string>,
  en: enMessages.home as Record<string, string>,
  ru: ruMessages.home as Record<string, string>,
};

// Every key the homepage references.
const requiredHomeKeys = [
  'hero_badge',
  'hero_title',
  'hero_cta_explore',
  'hero_cta_sell',
  'hero_pick_label',
  'hero_pick_name',
  'feature_shipping_title',
  'feature_shipping_desc',
  'feature_payment_title',
  'feature_payment_desc',
  'feature_returns_title',
  'feature_returns_desc',
  'categories_title',
  'categories_subtitle',
  'view_all',
  'cat_electronics',
  'cat_clothing',
  'cat_appliances',
  'cat_sports',
  'featured_subtitle',
  'vendor_eyebrow',
  'vendor_title',
  'vendor_desc',
  'vendor_cta',
];

describe('home namespace i18n keys (issue #53)', () => {
  it('covers every configured locale', () => {
    for (const locale of routing.locales) {
      expect(homeNamespaces[locale], `missing home fixture for ${locale}`).toBeDefined();
    }
  });

  for (const locale of routing.locales) {
    describe(`locale: ${locale}`, () => {
      const home = homeNamespaces[locale];

      it.each(requiredHomeKeys)('defines a non-empty home.%s', (key) => {
        expect(typeof home[key]).toBe('string');
        expect(home[key].trim().length).toBeGreaterThan(0);
      });

      // hero_title is rendered with t.rich() and a <brand> chunk. If the tags
      // are missing the rich render throws "no `brand` handler", so guard them —
      // and confirm the brand name itself survives translation.
      it('keeps the <brand>ShopFlow</brand> markup in hero_title for rich rendering', () => {
        expect(home.hero_title).toContain('<brand>');
        expect(home.hero_title).toContain('</brand>');
        expect(home.hero_title).toContain('ShopFlow');
      });
    });
  }
});
