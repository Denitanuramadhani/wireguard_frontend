"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

interface Column<T> {
  accessorKey?: keyof T | string
  header: string
  cell?: (row: T) => React.ReactNode
}

interface SimpleTableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
}

export function SimpleTable<T extends Record<string, any>>({
  data,
  columns,
  loading,
}: SimpleTableProps<T>) {
  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, idx) => (
              <TableHead key={column.accessorKey ? String(column.accessorKey) : `col-${idx}`}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">
                No data available
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((column, colIdx) => (
                  <TableCell key={column.accessorKey ? String(column.accessorKey) : `cell-${colIdx}`}>
                    {column.cell
                      ? column.cell(row)
                      : column.accessorKey
                        ? String(row[column.accessorKey as keyof T] ?? "")
                        : null}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}


