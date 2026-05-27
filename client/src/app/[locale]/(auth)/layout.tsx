// src/app/[locale]/(auth)/layout.tsx
// Premium split-screen auth layout: decorative branding panel + form panel

import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ShoppingBag, Zap, Shield, Globe } from 'lucide-react';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

interface AuthLayoutProps {
  children: React.ReactNode;
}

const FEATURES = [
  { icon: Zap, label: 'Sürətli çatdırılma', sub: '24 saat ərzində' },
  { icon: Shield, label: 'Təhlükəsiz ödəniş', sub: 'SSL şifrələnmiş' },
  { icon: Globe, label: '3 dil dəstəyi', sub: 'AZ · EN · RU' },
];

export default function AuthLayout({ children }: AuthLayoutProps): React.JSX.Element {
  return (
    <div className="flex min-h-screen w-full">
      {/* ── Left decorative panel (hidden on mobile) ───────────── */}
      <div className="relative hidden lg:flex lg:w-[52%] xl:w-[55%] flex-col overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-900">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-indigo-600/30 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-violet-700/30 blur-3xl" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-2xl" />

        {/* Grid pattern overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative flex flex-1 flex-col px-12 py-10">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 self-start group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm transition-all group-hover:bg-white/25">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">ShopFlow</span>
          </Link>

          {/* Hero copy */}
          <div className="mt-auto pb-4">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium text-indigo-200 ring-1 ring-white/10">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Azərbaycanın №1 e-ticarət platforması
            </div>

            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white xl:text-5xl">
              Alış-verişin
              <br />
              <span className="bg-gradient-to-r from-indigo-300 to-violet-300 bg-clip-text text-transparent">
                yeni nəsli
              </span>
            </h1>

            <p className="mt-4 max-w-sm text-base text-indigo-200/80 leading-relaxed">
              Minlərlə məhsul, etibarlı satıcılar və sürətli çatdırılma — hamısı bir platformada.
            </p>

            {/* Feature pills */}
            <div className="mt-8 flex flex-col gap-3">
              {FEATURES.map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex items-center gap-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
                    <Icon className="h-4 w-4 text-indigo-300" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{label}</p>
                    <p className="text-xs text-indigo-300/70">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom footnote */}
          <p className="mt-10 text-xs text-indigo-300/50">
            © {new Date().getFullYear()} ShopFlow. Bütün hüquqlar qorunur.
          </p>
        </div>
      </div>

      {/* ── Right form panel ──────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-y-auto bg-white dark:bg-slate-950">
        {/* Mobile logo */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800/60 lg:hidden">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 transition-all group-hover:bg-indigo-700">
              <ShoppingBag className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">ShopFlow</span>
          </Link>
        </div>

        {/* Form area */}
        <div className="flex flex-1 items-center justify-center px-6 py-12 sm:px-10 lg:px-16 xl:px-24">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}
