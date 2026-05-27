// src/components/ui/search-bar.tsx
// High-fidelity premium SearchBar component with standard icons, auto-clearing button, and custom built-in 300ms debounce trigger

"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchBarProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  onSearch: (value: string) => void;
  debounceMs?: number;
  initialValue?: string;
  showClearButton?: boolean;
}

export function SearchBar({
  onSearch,
  debounceMs = 300,
  initialValue = "",
  showClearButton = true,
  placeholder = "Axtarış...",
  className,
  ...props
}: SearchBarProps) {
  const [value, setValue] = useState(initialValue);
  const isFirstRender = useRef(true);

  // Sync with initialValue if it changes externally
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // Debounced input processing
  useEffect(() => {
    // Avoid firing onSearch on initial mount unless value was set
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (!value) return;
    }

    const handler = setTimeout(() => {
      onSearch(value);
    }, debounceMs);

    return () => {
      clearTimeout(handler);
    };
  }, [value, debounceMs, onSearch]);

  const handleClear = () => {
    setValue("");
  };

  return (
    <div className={cn("relative flex items-center w-full max-w-md", className)}>
      {/* Search Icon */}
      <span className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none">
        <Search className="h-4 w-4" />
      </span>

      {/* Input */}
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "flex h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 py-2.5 text-sm text-slate-900 transition-all duration-200 outline-none ring-0 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700/60 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500",
          className
        )}
        data-testid="search-bar-input"
        {...props}
      />

      {/* Clear Button */}
      {showClearButton && value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Axtarışı təmizlə"
          className="absolute right-3.5 rounded-lg p-0.5 text-slate-400 hover:bg-slate-50 hover:text-slate-650 dark:hover:bg-slate-800 transition-all duration-200"
          data-testid="search-bar-clear"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
