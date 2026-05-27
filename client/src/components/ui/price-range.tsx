// src/components/ui/price-range.tsx
// High-fidelity premium dual PriceRange slider component with interactive Indigo tracks, custom boundary highlights, and responsive design

"use client";

import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export interface PriceRangeProps {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  currencySymbol?: string;
  className?: string;
}

export function PriceRange({
  min,
  max,
  step = 1,
  value,
  onChange,
  currencySymbol = "AZN",
  className,
}: PriceRangeProps) {
  const [minVal, setMinVal] = useState(value[0]);
  const [maxVal, setMaxVal] = useState(value[1]);
  const minValRef = useRef(value[0]);
  const maxValRef = useRef(value[1]);
  const rangeRef = useRef<HTMLDivElement>(null);

  // Keep internal states in sync with external values
  useEffect(() => {
    setMinVal(value[0]);
    setMaxVal(value[1]);
    minValRef.current = value[0];
    maxValRef.current = value[1];
  }, [value]);

  // Calculate percentage to highlight track
  const getPercent = React.useCallback(
    (value: number) => Math.round(((value - min) / (max - min)) * 100),
    [min, max]
  );

  // Set width of the range track to show active selected region
  useEffect(() => {
    if (rangeRef.current) {
      const minPercent = getPercent(minVal);
      const maxPercent = getPercent(maxVal);

      rangeRef.current.style.left = `${minPercent}%`;
      rangeRef.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [minVal, maxVal, getPercent]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value), maxVal - step);
    setMinVal(val);
    minValRef.current = val;
    onChange([val, maxVal]);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(e.target.value), minVal + step);
    setMaxVal(val);
    maxValRef.current = val;
    onChange([minVal, val]);
  };

  return (
    <div className={cn("w-full py-4 px-2 select-none", className)} data-testid="price-range">
      {/* Slider inputs container */}
      <div className="relative h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
        {/* Active Highlight Track */}
        <div
          ref={rangeRef}
          className="absolute h-full rounded-full bg-indigo-600 dark:bg-indigo-500"
          data-testid="price-range-track"
        />

        {/* Min Input Slider */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minVal}
          onChange={handleMinChange}
          className="absolute pointer-events-none appearance-none h-0 w-full outline-none z-30 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-indigo-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-indigo-600 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-md"
          aria-label="Minimum price"
          data-testid="price-min-slider"
        />

        {/* Max Input Slider */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxVal}
          onChange={handleMaxChange}
          className="absolute pointer-events-none appearance-none h-0 w-full outline-none z-40 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-indigo-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-indigo-600 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-md"
          aria-label="Maximum price"
          data-testid="price-max-slider"
        />
      </div>

      {/* Value Displays */}
      <div className="mt-5 flex items-center justify-between">
        <div className="rounded-xl border border-slate-100 bg-slate-50/50 px-3.5 py-1.5 dark:border-slate-800 dark:bg-slate-950/20">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
            Min
          </span>
          <span className="text-sm font-black text-slate-800 dark:text-slate-200">
            {minVal} {currencySymbol}
          </span>
        </div>
        <div className="h-px w-4 bg-slate-200 dark:bg-slate-800" />
        <div className="rounded-xl border border-slate-100 bg-slate-50/50 px-3.5 py-1.5 dark:border-slate-800 dark:bg-slate-950/20 text-right">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
            Max
          </span>
          <span className="text-sm font-black text-slate-800 dark:text-slate-200">
            {maxVal} {currencySymbol}
          </span>
        </div>
      </div>
    </div>
  );
}
