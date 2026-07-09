// src/components/admin/data-table/data-table-view-options.tsx
// Column-visibility toggle. Reads each hideable column's `meta.title` (falling
// back to its id) so the labels stay translated by the calling page.

"use client";

import * as React from "react";
import type { Table } from "@tanstack/react-table";
import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
  label?: string;
}

export function DataTableViewOptions<TData>({
  table,
  label = "Sütunlar",
}: DataTableViewOptionsProps<TData>): React.JSX.Element {
  const columns = table
    .getAllColumns()
    .filter(
      (column) =>
        typeof column.accessorFn !== "undefined" && column.getCanHide(),
    );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="ml-auto hidden h-9 rounded-xl lg:flex"
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            {label}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-[180px]">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {columns.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            className="capitalize"
            checked={column.getIsVisible()}
            onCheckedChange={(value) => column.toggleVisibility(!!value)}
          >
            {column.columnDef.meta?.title ?? column.id}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
