"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ChevronDown, X } from 'lucide-react'

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DataTableProps<TData extends object, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onRowClick?: (row: TData) => void
}

export function DataTable<TData extends object, TValue>({
  columns,
  data,
  onRowClick,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState<string>('')
  const [activeFilters, setActiveFilters] = React.useState<string[]>([])

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    globalFilterFn: (row, columnId, filterValue: string) => {
      const value = row.getValue(columnId)
      if (typeof value === 'number') {
        return value.toString().includes(filterValue)
      }
      if (typeof value === 'boolean') {
        return value.toString().toLowerCase().includes(filterValue.toLowerCase())
      }
      if (typeof value === 'string') {
        return value.toLowerCase().includes(filterValue.toLowerCase())
      }
      if (value instanceof Date) {
        return value.toISOString().toLowerCase().includes(filterValue.toLowerCase())
      }
      return false
    },
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  })

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && globalFilter && !activeFilters.includes(globalFilter)) {
      setActiveFilters([...activeFilters, globalFilter])
      setGlobalFilter('')
    }
  }

  const removeFilter = (filter: string) => {
    setActiveFilters(activeFilters.filter(f => f !== filter))
  }

  React.useEffect(() => {
    table.setGlobalFilter(activeFilters.join(' '))
  }, [activeFilters, table])

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:space-x-2">
          <Input
            placeholder="Add filter keyword..."
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            onKeyDown={handleKeyDown}
            className="max-w-sm mb-2 md:mb-0"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter, index) => (
              <Badge key={index} variant="secondary" className="text-sm">
                {filter}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-2 h-auto p-0 text-muted-foreground hover:text-foreground"
                  onClick={() => removeFilter(filter)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}
      </div>
      <ScrollArea className="h-[calc(100vh-250px)]">
        <div className="space-y-2">
          {table.getRowModel().rows.map((row) => (
            <Card
              key={row.id}
              className={cn(
                "transition-colors hover:bg-muted/50 cursor-pointer",
                row.getIsSelected() && "bg-muted"
              )}
              onClick={() => onRowClick?.(row.original)}
            >
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {row.getVisibleCells().map((cell) => (
                    <div key={cell.id} className="flex flex-col">
                      <div className="font-medium text-sm text-muted-foreground mb-1">
                        {/* Cast header to string since all headers are strings */}
                        {cell.column.columnDef.header as string}
                      </div>
                      <div className="flex-grow">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
