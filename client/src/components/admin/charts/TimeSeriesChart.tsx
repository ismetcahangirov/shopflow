// src/components/admin/charts/TimeSeriesChart.tsx
// Thin recharts wrapper for a single-series time series, rendered either as a
// gradient area (revenue trends) or bars (order counts). Theme-aware via CSS
// custom properties so it follows light/dark mode. Excluded from unit-test
// coverage — it is a declarative SVG wrapper with no branching logic.
'use client';

import * as React from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export interface TimeSeriesChartProps {
  data: Array<Record<string, unknown>>;
  /** Key on each datum for the x-axis category (e.g. a date/period string). */
  xKey: string;
  /** Key on each datum for the plotted value. */
  yKey: string;
  variant?: 'area' | 'bar';
  /** CSS color for the series (default: indigo accent). */
  color?: string;
  height?: number;
  seriesName?: string;
  xTickFormatter?: (value: string) => string;
  /** Formats the tooltip value (full precision). */
  valueFormatter?: (value: number) => string;
  /** Formats the y-axis ticks (compact); falls back to `valueFormatter`. */
  yTickFormatter?: (value: number) => string;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string | number;
  xTickFormatter?: (value: string) => string;
  valueFormatter?: (value: number) => string;
  seriesName?: string;
}

function ChartTooltip({
  active,
  payload,
  label,
  xTickFormatter,
  valueFormatter,
  seriesName,
}: TooltipProps): React.JSX.Element | null {
  if (!active || !payload?.length) return null;
  const value = payload[0].value;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-medium text-foreground">
        {xTickFormatter ? xTickFormatter(String(label)) : String(label)}
      </p>
      <p className="text-muted-foreground">
        <span className="font-semibold text-foreground">
          {valueFormatter ? valueFormatter(value) : value}
        </span>
        {seriesName ? ` · ${seriesName}` : ''}
      </p>
    </div>
  );
}

export function TimeSeriesChart({
  data,
  xKey,
  yKey,
  variant = 'area',
  color = '#6366f1',
  height = 260,
  seriesName,
  xTickFormatter,
  valueFormatter,
  yTickFormatter,
}: TimeSeriesChartProps): React.JSX.Element {
  const gradientId = `grad-${yKey}`;
  const yFormatter = yTickFormatter ?? valueFormatter;
  const axisTick = { fontSize: 11, fill: 'var(--muted-foreground)' } as const;
  const tooltip = (
    <Tooltip
      cursor={{ fill: 'var(--muted)', fillOpacity: 0.4 }}
      content={
        <ChartTooltip
          xTickFormatter={xTickFormatter}
          valueFormatter={valueFormatter}
          seriesName={seriesName}
        />
      }
    />
  );

  return (
    <ResponsiveContainer width="100%" height={height}>
      {variant === 'bar' ? (
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey={xKey}
            tick={axisTick}
            tickLine={false}
            axisLine={{ stroke: 'var(--border)' }}
            tickFormatter={xTickFormatter}
            minTickGap={16}
          />
          <YAxis
            tick={axisTick}
            tickLine={false}
            axisLine={false}
            width={44}
            tickFormatter={yFormatter}
          />
          {tooltip}
          <Bar dataKey={yKey} fill={color} radius={[4, 4, 0, 0]} maxBarSize={48} />
        </BarChart>
      ) : (
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.35} />
              <stop offset="95%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey={xKey}
            tick={axisTick}
            tickLine={false}
            axisLine={{ stroke: 'var(--border)' }}
            tickFormatter={xTickFormatter}
            minTickGap={16}
          />
          <YAxis
            tick={axisTick}
            tickLine={false}
            axisLine={false}
            width={44}
            tickFormatter={yFormatter}
          />
          {tooltip}
          <Area
            type="monotone"
            dataKey={yKey}
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
          />
        </AreaChart>
      )}
    </ResponsiveContainer>
  );
}
