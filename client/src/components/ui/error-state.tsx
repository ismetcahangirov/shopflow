// src/components/ui/error-state.tsx
// High-fidelity premium ErrorState component with a sleek alert/error UI and optional onRetry callback handler

import * as React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryText?: string;
}

export function ErrorState({
  title = "Bir xəta baş verdi",
  message,
  onRetry,
  retryText = "Yenidən cəhd et",
  className,
  ...props
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 md:p-12 rounded-2xl border border-red-100 bg-red-50/20 dark:border-red-950/30 dark:bg-red-950/5",
        className
      )}
      data-testid="error-state"
      {...props}
    >
      {/* Icon Area */}
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-650 dark:bg-red-950/40 dark:text-red-400">
        <AlertCircle className="h-7 w-7" />
      </div>

      {/* Text Info */}
      <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        {message}
      </p>

      {/* Retry Action */}
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="mt-6 border-red-200 text-red-700 hover:bg-red-50 dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-950/20"
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
          {retryText}
        </Button>
      )}
    </div>
  );
}
