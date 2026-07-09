// src/components/admin/charts/StatusDonut.tsx
// Donut chart + legend for a small categorical breakdown (orders by status).
// Thin recharts wrapper — excluded from unit-test coverage.
'use client';

import * as React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

export interface DonutDatum {
  name: string;
  /** Optional human-readable label for the legend (defaults to `name`). */
  label?: string;
  value: number;
  color: string;
}

export interface StatusDonutProps {
  data: DonutDatum[];
  height?: number;
  valueFormatter?: (value: number) => string;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: DonutDatum }>;
  valueFormatter?: (value: number) => string;
}

function DonutTooltip({ active, payload, valueFormatter }: TooltipProps): React.JSX.Element | null {
  if (!active || !payload?.length) return null;
  const datum = payload[0].payload;
  const value = payload[0].value;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md">
      <span className="font-medium text-foreground">{datum.label ?? datum.name}</span>
      <span className="ml-2 text-muted-foreground">
        {valueFormatter ? valueFormatter(value) : value}
      </span>
    </div>
  );
}

export function StatusDonut({
  data,
  height = 240,
  valueFormatter,
}: StatusDonutProps): React.JSX.Element {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="relative shrink-0" style={{ width: height, height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<DonutTooltip valueFormatter={valueFormatter} />} />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="62%"
              outerRadius="90%"
              paddingAngle={2}
              strokeWidth={0}
            >
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-foreground">{total}</span>
        </div>
      </div>
      <ul className="flex w-full flex-col gap-2">
        {data.map((d) => (
          <li key={d.name} className="flex items-center justify-between gap-2 text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
              {d.label ?? d.name}
            </span>
            <span className="font-semibold text-foreground">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
