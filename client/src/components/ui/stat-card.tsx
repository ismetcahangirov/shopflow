// src/components/ui/stat-card.tsx
// High-fidelity premium styled StatCard component with trend directions, visual indicators, custom percentage highlights, and colorful backgrounds

import * as React from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  "relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 transition-all duration-200 hover:shadow-md",
  {
    variants: {
      colorTheme: {
        indigo: "hover:border-indigo-150/40 dark:hover:border-indigo-900/30",
        emerald: "hover:border-emerald-150/40 dark:hover:border-emerald-900/30",
        amber: "hover:border-amber-150/40 dark:hover:border-amber-900/30",
        rose: "hover:border-rose-150/40 dark:hover:border-rose-900/30",
        sky: "hover:border-sky-150/40 dark:hover:border-sky-900/30",
      },
    },
    defaultVariants: {
      colorTheme: "indigo",
    },
  }
);

const iconWrapperVariants = cva(
  "flex h-12 w-12 items-center justify-center rounded-2xl shrink-0 transition-transform duration-300 group-hover:scale-110",
  {
    variants: {
      colorTheme: {
        indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400",
        emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
        amber: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
        rose: "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400",
        sky: "bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400",
      },
    },
    defaultVariants: {
      colorTheme: "indigo",
    },
  }
);

export interface StatCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    direction: "up" | "down" | "neutral";
    label?: string;
  };
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  colorTheme = "indigo",
  className,
  ...props
}: StatCardProps) {
  const TrendIcon = trend
    ? trend.direction === "up"
      ? ArrowUpRight
      : trend.direction === "down"
      ? ArrowDownRight
      : Minus
    : null;

  const trendColor = trend
    ? trend.direction === "up"
      ? "text-emerald-600 dark:text-emerald-400"
      : trend.direction === "down"
      ? "text-rose-600 dark:text-rose-400"
      : "text-slate-500 dark:text-slate-400"
    : null;

  return (
    <div
      className={cn(cardVariants({ colorTheme }), "group", className)}
      data-testid="stat-card"
      {...props}
    >
      <div className="flex items-start justify-between">
        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate select-none">
            {title}
          </p>
          <h4 className="mt-2 text-2xl font-black tracking-tight text-slate-900 dark:text-white truncate">
            {value}
          </h4>

          {/* Trend Display */}
          {trend && (
            <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
              <span
                className={cn(
                  "inline-flex items-center text-xs font-bold gap-0.5",
                  trendColor
                )}
                data-testid="stat-trend"
              >
                {TrendIcon && <TrendIcon className="h-3.5 w-3.5" />}
                {trend.value}
              </span>
              {trend.label && (
                <span className="text-xs text-slate-400 dark:text-slate-500 select-none">
                  {trend.label}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Dynamic Icon Wrapper */}
        {icon && (
          <div className={cn(iconWrapperVariants({ colorTheme }))} data-testid="stat-icon">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
