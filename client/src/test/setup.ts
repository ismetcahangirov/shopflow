// src/test/setup.ts
// Test environment setup for Vitest and React Testing Library

import '@testing-library/jest-dom';
import { vi } from 'vitest';

// jsdom has no matchMedia; shadcn's useIsMobile()/SidebarProvider rely on it.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      prefetch: () => null,
      push: () => null,
      replace: () => null,
      back: () => null,
    };
  },
  usePathname() {
    return '';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'az',
  useMessages: () => ({}),
}));
vi.mock('next-intl/navigation', () => ({
  useRouter() {
    return {
      push: () => null,
      replace: () => null,
      back: () => null,
    };
  },
  usePathname() {
    return '';
  },
}));

// Mock next/image to behave like a standard img tag for easier onLoad/onError testing
// Strip Next.js-specific props that are not valid HTML attributes to avoid React DOM warnings.
import React from 'react';
vi.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage({
    src,
    alt,
    onLoad,
    onError,
    className,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    fill: _fill,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    priority: _priority,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    sizes: _sizes,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    quality: _quality,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    placeholder: _placeholder,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    blurDataURL: _blurDataURL,
    ...rest
  }: React.ImgHTMLAttributes<HTMLImageElement> & {
    fill?: boolean;
    priority?: boolean;
    sizes?: string;
    quality?: number;
    placeholder?: string;
    blurDataURL?: string;
  }) {
    return React.createElement('img', {
      src,
      alt,
      className,
      onLoad,
      onError,
      ...rest,
    });
  },
}));
