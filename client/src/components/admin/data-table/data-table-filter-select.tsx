// src/components/admin/data-table/data-table-filter-select.tsx
// Thin wrapper over the Base UI Select for server-driven toolbar filters. Pages
// pass a controlled value + labelled options; the `items` map lets SelectValue
// render the selected option's label reliably.

"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface FilterOption {
  value: string;
  label: string;
}

interface DataTableFilterSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: FilterOption[];
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
}

export function DataTableFilterSelect({
  value,
  onValueChange,
  options,
  placeholder,
  ariaLabel,
  className,
}: DataTableFilterSelectProps): React.JSX.Element {
  const items = React.useMemo(
    () => Object.fromEntries(options.map((o) => [o.value, o.label])),
    [options],
  );

  return (
    <Select
      value={value}
      onValueChange={(next) => onValueChange((next as string) ?? "")}
      items={items}
    >
      <SelectTrigger
        aria-label={ariaLabel ?? placeholder}
        className={cn("h-9 min-w-[150px] rounded-xl", className)}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
