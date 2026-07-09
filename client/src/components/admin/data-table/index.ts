// src/components/admin/data-table/index.ts
// Public surface of the reusable admin DataTable.

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";

import "./data-table-types";

export { DataTable, type DataTableProps } from "./data-table";
export { DataTableColumnHeader } from "./data-table-column-header";
export { DataTableViewOptions } from "./data-table-view-options";
export {
  DataTableFilterSelect,
  type FilterOption,
} from "./data-table-filter-select";

/**
 * A ready-made header/row checkbox column for row selection. Spread into a
 * page's column defs when bulk selection is useful.
 */
export function createSelectionColumn<TData>(
  ariaLabel = "Sətri seç",
): ColumnDef<TData> {
  return {
    id: "select",
    enableSorting: false,
    enableHiding: false,
    size: 40,
    header: ({ table }) =>
      React.createElement(Checkbox, {
        checked: table.getIsAllPageRowsSelected(),
        indeterminate: table.getIsSomePageRowsSelected(),
        onCheckedChange: (checked: boolean) =>
          table.toggleAllPageRowsSelected(checked),
        "aria-label": "Hamısını seç",
        className: "translate-y-[2px]",
      }),
    cell: ({ row }) =>
      React.createElement(Checkbox, {
        checked: row.getIsSelected(),
        onCheckedChange: (checked: boolean) => row.toggleSelected(checked),
        "aria-label": ariaLabel,
        className: "translate-y-[2px]",
        onClick: (e: React.MouseEvent) => e.stopPropagation(),
      }),
  };
}
