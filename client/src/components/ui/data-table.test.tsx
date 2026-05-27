// src/components/ui/data-table.test.tsx
// Tests for type-safe DataTable component: rendering, sorting, row selections, loading skeletons, and empty states

import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DataTable, Column } from "./data-table";

interface UserItem {
  id: string;
  name: string;
  age: number;
}

const columns: Column<UserItem>[] = [
  { key: "name", header: "İstifadəçi", sortable: true },
  { key: "age", header: "Yaş", sortable: true },
];

const mockData: UserItem[] = [
  { id: "1", name: "Elvin", age: 28 },
  { id: "2", name: "Ayan", age: 24 },
  { id: "3", name: "Murad", age: 31 },
];

describe("DataTable", () => {
  it("renders correctly with columns and data", () => {
    render(<DataTable columns={columns} data={mockData} />);

    expect(screen.getByText("İstifadəçi")).toBeInTheDocument();
    expect(screen.getByText("Yaş")).toBeInTheDocument();

    expect(screen.getByText("Elvin")).toBeInTheDocument();
    expect(screen.getByText("Ayan")).toBeInTheDocument();
    expect(screen.getByText("Murad")).toBeInTheDocument();
  });

  it("renders skeleton loading state when isLoading is true", () => {
    const { container } = render(<DataTable columns={columns} data={mockData} isLoading />);
    
    // Skeletons should be rendered
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
    
    // Real data should NOT be rendered
    expect(screen.queryByText("Elvin")).not.toBeInTheDocument();
  });

  it("renders empty state placeholder when data is empty", () => {
    render(
      <DataTable
        columns={columns}
        data={[]}
        emptyTitle="Boşdur"
        emptyDescription="Məlumat yoxdur"
      />
    );

    expect(screen.getByText("Boşdur")).toBeInTheDocument();
    expect(screen.getByText("Məlumat yoxdur")).toBeInTheDocument();
  });

  it("sorts rows when clicking on sortable column headers", () => {
    render(<DataTable columns={columns} data={mockData} />);

    const firstRowBefore = screen.getAllByRole("row")[1]; // Header is index 0
    expect(firstRowBefore).toHaveTextContent("Elvin");

    // Click sort by "Yaş" (Ascending: Ayan (24) -> Elvin (28) -> Murad (31))
    const ageHeader = screen.getByRole("button", { name: /yaş/i });
    fireEvent.click(ageHeader);

    const firstRowAfter = screen.getAllByRole("row")[1];
    expect(firstRowAfter).toHaveTextContent("Ayan");

    // Click sort again by "Yaş" (Descending: Murad (31) -> Elvin (28) -> Ayan (24))
    fireEvent.click(ageHeader);
    const firstRowDesc = screen.getAllByRole("row")[1];
    expect(firstRowDesc).toHaveTextContent("Murad");
  });

  it("handles checkboxes and triggers row selection changes", () => {
    const handleSelectionChange = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={mockData}
        selectable
        onSelectionChange={handleSelectionChange}
      />
    );

    const selectAllCheckbox = screen.getByLabelText("Select all rows");
    expect(selectAllCheckbox).not.toBeChecked();

    // Select row 1
    const firstCheckbox = screen.getByLabelText("Select row 1");
    fireEvent.click(firstCheckbox);
    expect(firstCheckbox).toBeChecked();
    expect(handleSelectionChange).toHaveBeenLastCalledWith([mockData[0]]);

    // Select all
    fireEvent.click(selectAllCheckbox);
    expect(selectAllCheckbox).toBeChecked();
    expect(handleSelectionChange).toHaveBeenLastCalledWith(mockData);
  });
});
