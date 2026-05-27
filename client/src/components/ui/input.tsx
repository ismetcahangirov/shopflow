// src/components/ui/input.tsx
// Reusable input component with error styling, leading/trailing icon support

'use client';

import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Shows a red border and ring when true */
  hasError?: boolean;
  /** Icon rendered on the left side inside the input */
  leadingIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, hasError, leadingIcon, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="relative flex items-center">
        {leadingIcon && (
          <span className="pointer-events-none absolute left-3 text-slate-400 dark:text-slate-500">
            {leadingIcon}
          </span>
        )}

        <input
          ref={ref}
          type={resolvedType}
          className={cn(
            'flex h-11 w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900',
            'placeholder:text-slate-400 transition-all duration-200',
            'outline-none ring-0',
            'focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500',
            hasError
              ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500/60'
              : 'border-slate-200 dark:border-slate-700/60',
            leadingIcon && 'pl-10',
            isPassword && 'pr-10',
            className,
          )}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export { Input };
