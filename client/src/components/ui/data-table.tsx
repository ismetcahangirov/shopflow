// src/components/ui/data-table.tsx
// High-fidelity premium styled type-safe reusable DataTable component with sorting, selection checkboxes, row action buttons, loader skeletons, and EmptyState integration

"use client";

import React, { useState } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "./table";
import { Skeleton } from "./skeleton";
import { EmptyState } from "./empty-state";

export interface Column<T> {
  key: string & keyof T;
  header: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  selectable?: boolean;
  onSelectionChange?: (selectedRows: T[]) => void;
  actions?: (row: T) => React.ReactNode;
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  isLoading = false,
  emptyTitle = "Məlumat yoxdur",
  emptyDescription = "Göstəriləcək hər hansı bir məlumat tapılmadı.",
  selectable = false,
  onSelectionChange,
  actions,
}: DataTableProps<T>) {
  // Sort State
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);

  // Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortKey(null);
        setSortDirection(null);
      }
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  // Sorting logic
  const sortedData = React.useMemo(() => {
    if (!sortKey || !sortDirection) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal === bVal) return 0;

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }

      const aString = String(aVal).toLowerCase();
      const bString = String(bVal).toLowerCase();

      return sortDirection === "asc"
        ? aString.localeCompare(bString)
        : bString.localeCompare(aString);
    });
  }, [data, sortKey, sortDirection]);

  // Selection logic
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    const newSelected = new Set<string | number>();

    if (isChecked) {
      data.forEach((row) => newSelected.add(row.id));
    }

    setSelectedIds(newSelected);
    if (onSelectionChange) {
      onSelectionChange(isChecked ? data : []);
    }
  };

  const handleSelectRow = (id: string | number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }

    setSelectedIds(newSelected);
    if (onSelectionChange) {
      const selectedRows = data.filter((r) => newSelected.has(r.id));
      onSelectionChange(selectedRows);
    }
  };

  const isAllSelected = data.length > 0 && selectedIds.size === data.length;

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            {selectable && (
              <TableHead className="w-12 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-650 focus:ring-indigo-500/20"
                  aria-label="Select all rows"
                />
              </TableHead>
            )}

            {columns.map((col) => {
              const isSorted = sortKey === col.key;

              return (
                <TableHead key={String(col.key)}>
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => handleSort(col.key)}
                      className="group flex items-center gap-1.5 font-bold uppercase tracking-wider text-xs text-slate-500 hover:text-slate-900 transition-colors focus:outline-none dark:text-slate-400 dark:hover:text-white"
                    >
                      {col.header}
                      {isSorted ? (
                        sortDirection === "asc" ? (
                          <ArrowUp className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                        ) : (
                          <ArrowDown className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                        )
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </TableHead>
              );
            })}

            {actions && <TableHead className="w-20 text-right">Əməliyyatlar</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            // Skeleton loader state
            Array.from({ length: 5 }).map((_, rIdx) => (
              <TableRow key={`ske-row-${rIdx}`}>
                {selectable && (
                  <TableCell className="w-12 text-center">
                    <Skeleton className="h-4 w-4 mx-auto rounded" />
                  </TableCell>
                )}
                {columns.map((col) => (
                  <TableCell key={`ske-cell-${String(col.key)}`}>
                    <Skeleton className="h-4 w-2/3 rounded-lg" />
                  </TableCell>
                ))}
                {actions && (
                  <TableCell className="w-20 text-right">
                    <Skeleton className="h-8 w-14 ml-auto rounded-lg" />
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : sortedData.length === 0 ? (
            // Empty State rendered directly inside the table body
            <TableRow>
              <TableCell
                colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}
                className="p-0 border-0"
              >
                <EmptyState
                  title={emptyTitle}
                  description={emptyDescription}
                  className="rounded-none border-0 bg-transparent py-16"
                />
              </TableCell>
            </TableRow>
          ) : (
            // Main data rows
            sortedData.map((row) => {
              const isSelected = selectedIds.has(row.id);

              return (
                <TableRow key={row.id} data-state={isSelected ? "selected" : undefined}>
                  {selectable && (
                    <TableCell className="w-12 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(row.id)}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-650 focus:ring-indigo-500/20"
                        aria-label={`Select row ${row.id}`}
                      />
                    </TableCell>
                  )}

                  {columns.map((col) => (
                    <TableCell key={String(col.key)}>
                      {col.render ? col.render(row) : (row[col.key] as React.ReactNode)}
                    </TableCell>
                  ))}

                  {actions && (
                    <TableCell className="w-20 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {actions(row)}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
