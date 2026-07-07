// src/components/ui/form-field.tsx
// Composable FormField: wraps Label, Input, and animated error message

'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input, type InputProps } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface FormFieldProps extends InputProps {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  /** Optional helper text shown below the input when no error */
  hint?: string;
}

// Wrapped in forwardRef so that react-hook-form's register() ref reaches the
// underlying <input>. Without this the ref is dropped on the function component
// and RHF cannot read field values, which silently breaks form validation.
const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, htmlFor, error, required, hint, className, ...inputProps }, ref): React.JSX.Element => {
    return (
      <div className={cn('flex flex-col gap-0', className)}>
        <Label htmlFor={htmlFor} required={required}>
          {label}
        </Label>

        <Input
          ref={ref}
          id={htmlFor}
          hasError={!!error}
          aria-describedby={error ? `${htmlFor}-error` : hint ? `${htmlFor}-hint` : undefined}
          aria-invalid={!!error}
          {...inputProps}
        />

        {/* Animated error message */}
        <div
          className={cn(
            'overflow-hidden transition-all duration-200',
            error ? 'max-h-10 mt-1.5' : 'max-h-0 mt-0',
          )}
        >
          {error && (
            <p
              id={`${htmlFor}-error`}
              role="alert"
              className="text-xs text-red-500 dark:text-red-400"
            >
              {error}
            </p>
          )}
        </div>

        {/* Hint text (only shown when no error) */}
        {hint && !error && (
          <p id={`${htmlFor}-hint`} className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            {hint}
          </p>
        )}
      </div>
    );
  },
);

FormField.displayName = 'FormField';

export { FormField };
