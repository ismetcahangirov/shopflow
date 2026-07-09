import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable, DataTableColumnHeader } from './index';

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
});
