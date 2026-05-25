// src/test/setup.ts
// Test environment setup for Vitest and React Testing Library

import '@testing-library/jest-dom';
import { vi } from 'vitest';

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
