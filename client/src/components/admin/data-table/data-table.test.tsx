import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import type { ColumnDef } from '@tanstack/react-table';
import {
  DataTable,
  DataTableColumnHeader,
  DataTableFilterSelect,
  createSelectionColumn,
} from './index';

interface Row {
  id: string;
  name: string;
  age: number;
}

const data: Row[] = [
  { id: '1', name: 'Elvin', age: 28 },
  { id: '2', name: 'Ayan', age: 24 },
  { id: '3', name: 'Murad', age: 31 },
];

const columns: ColumnDef<Row>[] = [
  {
    accessorKey: 'name',
    meta: { title: 'Name' },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => <span>{row.original.name}</span>,
  },
  {
    accessorKey: 'age',
    meta: { title: 'Age' },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Age" />,
    cell: ({ row }) => <span>{row.original.age}</span>,
  },
];

describe('DataTable', () => {
  it('renders columns and rows', () => {
    render(<DataTable columns={columns} data={data} />);
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('Elvin')).toBeInTheDocument();
    expect(screen.getByText('Ayan')).toBeInTheDocument();
    expect(screen.getByText('Murad')).toBeInTheDocument();
  });

  it('renders skeleton rows while loading (no data)', () => {
    render(<DataTable columns={columns} data={[]} isLoading />);
    expect(screen.queryByText('Elvin')).not.toBeInTheDocument();
  });

  it('renders the empty state', () => {
    render(
      <DataTable columns={columns} data={[]} emptyTitle="Nothing here" emptyDescription="Try again" />,
    );
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('renders the error state and calls onRetry', () => {
    const onRetry = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={[]}
        isError
        errorTitle="Boom"
        onRetry={onRetry}
        resetLabel="Retry"
      />,
    );
    expect(screen.getByText('Boom')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Retry/i }));
    expect(onRetry).toHaveBeenCalled();
  });

  it('drives search through the toolbar', () => {
    const onSearchChange = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={data}
        searchValue=""
        onSearchChange={onSearchChange}
        searchPlaceholder="Search..."
      />,
    );
    fireEvent.change(screen.getByPlaceholderText('Search...'), { target: { value: 'el' } });
    expect(onSearchChange).toHaveBeenCalledWith('el');
  });

  it('renders server pagination and calls onPageChange', () => {
    const onPageChange = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={data}
        page={1}
        pageCount={3}
        total={25}
        pageSize={10}
        onPageChange={onPageChange}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /Növbəti səhifə/i }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('sorts client-side when a sortable header is clicked', () => {
    render(<DataTable columns={columns} data={data} />);
    // Sort by name ascending: Ayan, Elvin, Murad
    fireEvent.click(screen.getByRole('button', { name: /Name/i }));
    const rows = screen.getAllByRole('row');
    // rows[0] is the header row; first data row should now be "Ayan"
    expect(within(rows[1]).getByText('Ayan')).toBeInTheDocument();
  });

  it('renders the full toolbar (filter select + view options + reset)', () => {
    const onResetFilters = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={data}
        searchValue=""
        onSearchChange={vi.fn()}
        searchPlaceholder="Search..."
        filters={
          <DataTableFilterSelect
            value="all"
            onValueChange={vi.fn()}
            ariaLabel="Status"
            placeholder="Status"
            options={[
              { value: 'all', label: 'All' },
              { value: 'x', label: 'X' },
            ]}
          />
        }
        showViewOptions
        viewOptionsLabel="Columns"
        onResetFilters={onResetFilters}
        isFiltered
        resetLabel="Reset"
      />,
    );
    expect(screen.getByRole('button', { name: /Columns/i })).toBeInTheDocument();
    // Reset button visible because isFiltered is true
    fireEvent.click(screen.getByRole('button', { name: /Reset/i }));
    expect(onResetFilters).toHaveBeenCalled();
  });

  it('supports a selection column and reports the selected count', () => {
    const selectionColumn = createSelectionColumn<Row>('Select row');
    render(
      <DataTable
        columns={[selectionColumn, ...columns]}
        data={data}
        enableRowSelection
        page={1}
        pageCount={1}
        total={3}
        onPageChange={vi.fn()}
      />,
    );
    // Footer selection summary is rendered when selection is enabled
    expect(screen.getByText(/sətir seçilib/i)).toBeInTheDocument();
    // Select the first data row via its checkbox
    const checkboxes = screen.getAllByRole('checkbox', { name: /Select row/i });
    fireEvent.click(checkboxes[0]);
    expect(screen.getByText(/1 \/ 3 sətir seçilib/i)).toBeInTheDocument();
  });

  it('calls onRowClick when a row is clicked', () => {
    const onRowClick = vi.fn();
    render(<DataTable columns={columns} data={data} onRowClick={onRowClick} />);
    fireEvent.click(screen.getByText('Elvin'));
    expect(onRowClick).toHaveBeenCalledWith(expect.objectContaining({ name: 'Elvin' }));
  });
});
