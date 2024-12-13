// src/components/columns.tsx

"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Media } from "@/types/media"; // Correct import path
import { Badge } from "@/components/ui/badge";

export const columns: ColumnDef<Media, unknown>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <span className="font-medium">{row.getValue("name")}</span>,
  },
  {
    accessorKey: "location",
    header: "Location",
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(price);

      return <span className="font-medium">{formatted}</span>;
    },
  },
  {
    accessorKey: "availability",
    header: "Status",
    cell: ({ row }) => {
      const availability = row.getValue("availability");
      return (
        <Badge variant={availability ? "secondary" : "destructive"}>
          {availability ? "Available" : "Unavailable"}
        </Badge>
      );
    },
  },
];
