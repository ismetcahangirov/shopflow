// src/components/layout/Breadcrumb.tsx
// Rich SEO-friendly Breadcrumbs with structured JSON-LD data

'use client';

import React from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps): React.JSX.Element {
  const locale = useLocale();

  // Create list items including Home by default
  const allItems: BreadcrumbItem[] = [
    { label: 'Ana səhifə', href: '/' },
    ...items,
  ];

  // Construct JSON-LD structure for Search Engine Optimization
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: allItems.map((item, index) => {
      const isLast = index === allItems.length - 1;
      const url = item.href 
        ? `${process.env.NEXT_PUBLIC_CLIENT_URL || 'https://shopflow.az'}/${locale}${item.href === '/' ? '' : item.href}`
        : undefined;

      return {
        '@type': 'ListItem',
        position: index + 1,
        name: item.label,
        ...(url && !isLast ? { item: url } : {}),
      };
    }),
  };

  return (
    <>
      {/* Structured data injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav aria-label="Breadcrumb" className="py-3.5 flex items-center overflow-x-auto scrollbar-none">
        <ol className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 whitespace-nowrap">
          {allItems.map((item, index) => {
            const isLast = index === allItems.length - 1;
            
            return (
              <li key={index} className="flex items-center gap-1.5">
                {index > 0 && (
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0 select-none" />
                )}

                {item.href && !isLast ? (
                  <Link
                    href={`/${locale}${item.href === '/' ? '' : item.href}`}
                    className="flex items-center gap-1 text-slate-500 hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors"
                  >
                    {index === 0 && <Home className="h-3.5 w-3.5 shrink-0" />}
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <span className="text-slate-800 dark:text-slate-200 font-bold" aria-current="page">
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
