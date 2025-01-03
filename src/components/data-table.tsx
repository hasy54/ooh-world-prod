'use client'

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onRowClick: (item: TData) => void
  onRowSelect: (item: TData, isSelected: boolean) => void
  selectedItemId: string | null
  selectedItems: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowClick,
  onRowSelect,
  selectedItemId,
  selectedItems,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-4">
        No data available.
      </div>
    )
  }

  return (
    <div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent border-b border-t">
              <TableHead className="w-[40px] p-0">
                <Checkbox
                  checked={selectedItems.length === data.length && data.length > 0}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      // Select all items
                      data.forEach(item => onRowSelect(item, true));
                    } else {
                      // Deselect all items
                      selectedItems.forEach(item => onRowSelect(item, false));
                    }
                  }}
                />
              </TableHead>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="text-xs font-medium text-muted-foreground h-10">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={(row.original as any).id === selectedItemId ? "selected" : undefined}
              className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                (row.original as any).id === selectedItemId ? 'bg-muted' : ''
              }`}
              onClick={() => onRowClick(row.original)}
            >
              <TableCell className="p-0">
                <Checkbox
                  checked={selectedItems.some(item => (item as any).id === (row.original as any).id)}
                  onCheckedChange={(checked) => {
                    onRowSelect(row.original, !!checked)
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              </TableCell>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="py-3">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

