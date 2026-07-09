// src/components/admin/ChartCard.tsx
// A Card wrapper for admin dashboard/analytics panels: title + optional
// description/action, with built-in loading, empty and error states so the
// dashboard and analytics pages stay declarative.
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface ChartCardProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  isLoading?: boolean;
  isError?: boolean;
  isEmpty?: boolean;
  errorText?: string;
  emptyText?: string;
  /** Height (px) used by the loading skeleton so layout doesn't jump. */
  skeletonHeight?: number;
  className?: string;
  contentClassName?: string;
  children?: React.ReactNode;
}

export function ChartCard({
  title,
  description,
  action,
  isLoading = false,
  isError = false,
  isEmpty = false,
  errorText = 'Bir xəta baş verdi',
  emptyText = 'Məlumat yoxdur',
  skeletonHeight = 240,
  className,
  contentClassName,
  children,
}: ChartCardProps): React.JSX.Element {
  return (
    <Card className={cn('gap-4', className)} data-testid="chart-card">
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div className="space-y-1">
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </CardHeader>
      <CardContent className={contentClassName}>
        {isLoading ? (
          <Skeleton className="w-full rounded-lg" style={{ height: skeletonHeight }} />
        ) : isError ? (
          <div
            className="flex items-center justify-center py-10 text-sm text-destructive"
            data-testid="chart-card-error"
          >
            {errorText}
          </div>
        ) : isEmpty ? (
          <div
            className="flex items-center justify-center py-10 text-sm text-muted-foreground"
            data-testid="chart-card-empty"
          >
            {emptyText}
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
