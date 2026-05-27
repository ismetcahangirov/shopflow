// src/components/ui/page-header.tsx
// High-fidelity premium PageHeader component with breadcrumbs support, headers, subheadings, and customizable right-aligned actions list

import * as React from "react";
import { cn } from "@/lib/utils";

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  breadcrumbs?: React.ReactNode;
  actions?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 border-b border-slate-100 pb-5 dark:border-slate-800 md:flex-row md:items-center md:justify-between w-full select-none",
        className
      )}
      data-testid="page-header"
      {...props}
    >
      {/* Title & Info */}
      <div className="space-y-1.5 min-w-0">
        {breadcrumbs && <div className="mb-2.5">{breadcrumbs}</div>}
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white md:text-3xl truncate">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl truncate">
            {description}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      {actions && (
        <div
          className="flex flex-wrap items-center gap-3 shrink-0"
          data-testid="page-header-actions"
        >
          {actions}
        </div>
      )}
    </div>
  );
}
