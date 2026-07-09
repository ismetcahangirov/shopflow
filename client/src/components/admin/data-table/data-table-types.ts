// src/components/admin/data-table/data-table-types.ts
// Module augmentation for TanStack Table column meta so column defs can carry a
// human-readable title (used by the view-options / column-visibility menu) and
// optional cell/header className overrides.

import type { RowData } from "@tanstack/react-table";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    /** Human-readable label shown in the column-visibility menu. */
    title?: string;
    /** Extra className applied to every body cell of this column. */
    className?: string;
    /** Extra className applied to the header cell of this column. */
    headerClassName?: string;
  }
}
