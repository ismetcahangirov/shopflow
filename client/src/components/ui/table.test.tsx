// src/components/ui/table.test.tsx
// Tests for Table subcomponents: rendering headers, bodies, rows, and cells

import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "./table";

describe("Table Component Suite", () => {
  it("renders table structure correctly with subcomponents", () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Adı</TableHead>
            <TableHead>Qiymət</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Telefon</TableCell>
            <TableCell>1200 AZN</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /adı/i })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: /telefon/i })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: /1200 azn/i })).toBeInTheDocument();
  });
});
