// src/components/admin/data-table/data-table.tsx
// Reusable admin DataTable built on TanStack Table. Handles: typed column defs,
// client-side sorting of the current page, column visibility, optional row
// selection, a shared toolbar (search + parent-supplied filter slot + view
// options + reset), skeleton loading, error + empty states, and SERVER-side
// pagination driven by the caller's { page, pages, total, limit }.

"use client";

import * as React from "react";
import {
  type ColumnDef,
  type OnChangeFn,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { AlertCircle, RotateCcw, Search, X } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { DataTableViewOptions } from "./data-table-view-options";

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];

  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  errorTitle?: string;
  errorDescription?: string;

  // --- Toolbar ---
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  /** Parent-supplied filter controls (e.g. shadcn Selects) rendered in the toolbar. */
  filters?: React.ReactNode;
  /** Extra actions rendered on the right of the toolbar (before view options). */
  toolbarActions?: React.ReactNode;
  showViewOptions?: boolean;
  viewOptionsLabel?: string;
  /** When set together with `isFiltered`, renders a reset button. */
  onResetFilters?: () => void;
  isFiltered?: boolean;
  resetLabel?: string;

  // --- Server pagination ---
  page?: number;
  pageCount?: number;
  total?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;

  // --- Row selection ---
  enableRowSelection?: boolean;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  getRowId?: (row: TData, index: number) => string;

  // --- States ---
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: React.ReactNode;

  initialColumnVisibility?: VisibilityState;
  onRowClick?: (row: TData) => void;
  /** Test/query hook. */
  "data-testid"?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  isError = false,
  onRetry,
  errorTitle = "Xəta baş verdi",
  errorDescription = "Məlumatlar yüklənərkən xəta baş verdi. Yenidən cəhd edin.",
  searchValue,
  onSearchChange,
  searchPlaceholder = "Axtar...",
  filters,
  toolbarActions,
  showViewOptions = false,
  viewOptionsLabel,
  onResetFilters,
  isFiltered = false,
  resetLabel = "Sıfırla",
  page,
  pageCount,
  total,
  pageSize = 10,
  onPageChange,
  enableRowSelection = false,
  rowSelection,
  onRowSelectionChange,
  getRowId,
  emptyTitle = "Məlumat yoxdur",
  emptyDescription = "Göstəriləcək hər hansı bir məlumat tapılmadı.",
  emptyIcon,
  initialColumnVisibility,
  onRowClick,
  "data-testid": dataTestId,
}: DataTableProps<TData, TValue>): React.JSX.Element {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(initialColumnVisibility ?? {});
  const [internalSelection, setInternalSelection] =
    React.useState<RowSelectionState>({});

  const selection = rowSelection ?? internalSelection;

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      ...(enableRowSelection ? { rowSelection: selection } : {}),
    },
    enableRowSelection,
    onRowSelectionChange: onRowSelectionChange ?? setInternalSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId,
    manualPagination: true,
    manualFiltering: true,
    manualSorting: false,
    pageCount: pageCount ?? -1,
  });

  const hasToolbar =
    Boolean(onSearchChange) ||
    Boolean(filters) ||
    Boolean(toolbarActions) ||
    showViewOptions;

  const colCount = table.getVisibleLeafColumns().length || columns.length;
  const selectedCount = enableRowSelection
    ? table.getFilteredSelectedRowModel().rows.length
    : 0;

  return (
    <div className="w-full space-y-4" data-testid={dataTestId}>
      {/* Toolbar */}
      {hasToolbar && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            {onSearchChange && (
              <div className="relative w-full sm:w-auto sm:min-w-[240px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchValue ?? ""}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="h-9 rounded-xl pl-9"
                  aria-label={searchPlaceholder}
                />
              </div>
            )}
            {filters}
            {onResetFilters && isFiltered && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onResetFilters}
                className="h-9 rounded-xl px-2.5"
              >
                {resetLabel}
                <X className="ml-1.5 h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {toolbarActions}
            {showViewOptions && (
              <DataTableViewOptions table={table} label={viewOptionsLabel} />
            )}
          </div>
        </div>
      )}

      {/* Table surface */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <Table className="rounded-none border-0">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={header.column.columnDef.meta?.headerClassName}
                    style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, rIdx) => (
                <TableRow key={`skeleton-${rIdx}`} className="hover:bg-transparent">
                  {table.getVisibleLeafColumns().map((col) => (
                    <TableCell key={`skeleton-${rIdx}-${col.id}`}>
                      <Skeleton className="h-5 w-2/3 rounded-lg" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : isError ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={colCount} className="p-0">
                  <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400">
                      <AlertCircle className="h-7 w-7" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-lg font-bold text-foreground">
                        {errorTitle}
                      </h3>
                      <p className="mx-auto max-w-sm text-sm text-muted-foreground">
                        {errorDescription}
                      </p>
                    </div>
                    {onRetry && (
                      <Button
                        variant="outline"
                        onClick={onRetry}
                        className="rounded-xl"
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        {resetLabel}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={colCount} className="p-0">
                  <EmptyState
                    icon={emptyIcon}
                    title={emptyTitle}
                    description={emptyDescription}
                    className="rounded-none border-0 bg-transparent py-16"
                  />
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  className={cn(onRowClick && "cursor-pointer")}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cell.column.columnDef.meta?.className}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Footer: selection summary + server pagination */}
        {(onPageChange || enableRowSelection) && !isLoading && !isError && (
          <div className="flex flex-col gap-2 border-t border-border px-4 py-2 sm:flex-row sm:items-center sm:justify-between">
            {enableRowSelection ? (
              <p className="text-sm text-muted-foreground">
                {selectedCount} / {data.length} sətir seçilib
              </p>
            ) : (
              <span className="hidden sm:block" />
            )}
            {onPageChange && page !== undefined && pageCount !== undefined && (
              <Pagination
                currentPage={page}
                totalPages={pageCount}
                onPageChange={onPageChange}
                totalEntries={total}
                pageSize={pageSize}
                className="w-full py-2 sm:w-auto"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
