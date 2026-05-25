// src/i18n/request.ts
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as 'az' | 'en' | 'ru')) {
    locale = routing.defaultLocale;
  }

  const messages = (
    await import(`../../messages/${locale}.json`)
  ) as { default: Record<string, unknown> };

  return {
    locale,
    messages: messages.default,
  };
});
