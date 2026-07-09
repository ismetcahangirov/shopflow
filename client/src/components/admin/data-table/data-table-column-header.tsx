// src/components/admin/data-table/data-table-column-header.tsx
// Sortable column header: a ghost button that cycles asc <-> desc, with an arrow
// indicator. Icon-only sort affordance keeps the header locale-agnostic (the
// visible label is always the translated `title` passed by the page).

"use client";

import * as React from "react";
import type { Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>): React.JSX.Element {
  if (!column.getCanSort()) {
    return (
      <span
        className={cn(
          "text-xs font-bold uppercase tracking-wider text-muted-foreground",
          className,
        )}
      >
        {title}
      </span>
    );
  }

  const sorted = column.getIsSorted();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => column.toggleSorting(sorted === "asc")}
      className={cn(
        "-ml-3 h-8 gap-1.5 px-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground data-[state=open]:bg-accent",
        className,
      )}
    >
      <span>{title}</span>
      {sorted === "desc" ? (
        <ArrowDown className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
      ) : sorted === "asc" ? (
        <ArrowUp className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
      ) : (
        <ChevronsUpDown className="h-3.5 w-3.5 opacity-50" />
      )}
    </Button>
  );
}
