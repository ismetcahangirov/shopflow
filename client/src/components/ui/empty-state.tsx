// src/components/ui/empty-state.tsx
// High-fidelity premium EmptyState component with beautiful illustrative styles, custom icons, actions, and smooth responsive layout

import * as React from "react";
import { FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 md:p-12 rounded-2xl border border-dashed border-slate-200/80 bg-slate-50/30 dark:border-slate-800 dark:bg-slate-950/10",
        className
      )}
      data-testid="empty-state"
      {...props}
    >
      {/* Icon Area */}
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50/60 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400">
        {icon || <FolderOpen className="h-7 w-7" />}
      </div>

      {/* Text Info */}
      <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        {description}
      </p>

      {/* Optional Call to Action */}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
