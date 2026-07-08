// src/app/[locale]/not-found.test.tsx
// Regression tests for issue #50: unknown product/URLs crashed with a hydration
// error ("Only one element on document allowed") because the app had no
// not-found boundary, so Next.js rendered a bare <div> directly under
// <#document> with no <html>/<body> wrapper.
//
// The localized not-found renders INSIDE [locale]/layout.tsx, which already
// supplies <html>/<body> and NextIntlClientProvider — so it must emit content
// ONLY. Emitting its own document tags would recreate the invalid DOM.

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { routing } from '@/i18n/routing';
import azMessages from '../../../messages/az.json';
import enMessages from '../../../messages/en.json';
import ruMessages from '../../../messages/ru.json';
import LocaleNotFound from './not-found';

describe('LocaleNotFound (issue #50)', () => {
  it('renders the 404 heading', () => {
    render(<LocaleNotFound />);
    expect(screen.getByText('404')).toBeInTheDocument();
  });

  it('offers at least two ways back into the app', () => {
    render(<LocaleNotFound />);
    expect(screen.getAllByRole('link').length).toBeGreaterThanOrEqual(2);
  });

  // The exact crash cause: a not-found that emits <html>/<body> while nested
  // inside the locale layout produces an invalid document. Content only.
  it('does not render its own <html> or <body>', () => {
    const { container } = render(<LocaleNotFound />);
    expect(container.querySelector('html')).toBeNull();
    expect(container.querySelector('body')).toBeNull();
  });
});

// Guard the translation keys the 404 UI depends on, across every locale — a
// missing key would leak the raw key path to users (cf. issue #52).
describe('notFound namespace i18n keys (issue #50)', () => {
  const messagesByLocale: Record<string, { notFound?: Record<string, string> }> = {
    az: azMessages,
    en: enMessages,
    ru: ruMessages,
  };
  const requiredKeys = ['title', 'description', 'back_home', 'browse_products'];

  for (const locale of routing.locales) {
    it.each(requiredKeys)(`[${locale}] defines a non-empty notFound.%s`, (key) => {
      const ns = messagesByLocale[locale].notFound;
      expect(ns, `missing notFound namespace for ${locale}`).toBeDefined();
      expect(typeof ns?.[key]).toBe('string');
      expect(ns?.[key].trim().length).toBeGreaterThan(0);
    });
  }
});
