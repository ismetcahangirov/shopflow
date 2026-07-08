// src/components/ui/badge.tsx
// High-fidelity premium Badge component with 6 variants, sizes, and dot indicator support

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full font-bold transition-all duration-250 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-indigo-50/60 text-indigo-700 border border-indigo-100/50 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/40",
        secondary:
          "bg-slate-50 text-slate-700 border border-slate-200/60 dark:bg-slate-900/60 dark:text-slate-300 dark:border-slate-800/80",
        outline:
          "border border-slate-200 bg-transparent text-slate-650 dark:border-slate-850 dark:text-slate-400",
        destructive:
          "bg-rose-50 text-white border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30",
        success:
          "bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30",
        warning:
          "bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs gap-1.5",
        sm: "px-2 py-0.5 text-[0.7rem] gap-1",
        lg: "px-3 py-1 text-sm gap-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const dotVariants = cva(
  "h-1.5 w-1.5 rounded-full shrink-0 animate-[pulse_2s_infinite]",
  {
    variants: {
      variant: {
        default: "bg-indigo-600 dark:bg-indigo-400",
        secondary: "bg-slate-550 dark:bg-slate-400",
        outline: "bg-slate-400 dark:bg-slate-500",
        destructive: "bg-rose-600 dark:bg-rose-400",
        success: "bg-emerald-600 dark:bg-emerald-400",
        warning: "bg-amber-600 dark:bg-amber-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  showDot?: boolean;
}

function Badge({
  className,
  variant,
  size,
  showDot = false,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    >
      {showDot && (
        <span
          className={dotVariants({
            variant: variant as
              | "default"
              | "secondary"
              | "outline"
              | "destructive"
              | "success"
              | "warning"
              | null
              | undefined,
          })}
          data-testid="badge-dot"
        />
      )}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
