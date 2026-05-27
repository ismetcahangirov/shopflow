// src/components/ui/label.tsx
// Accessible label component with required indicator support

import React, { type LabelHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

function Label({ className, children, required, ...props }: LabelProps): React.JSX.Element {
  return (
    <label
      className={cn(
        'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5',
        className,
      )}
      {...props}
    >
      {children}
      {required && (
        <span className="ml-1 text-red-500" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}

export { Label };
