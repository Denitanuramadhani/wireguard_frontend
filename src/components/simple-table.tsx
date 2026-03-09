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
      <div className="rounded-xl border border-slate-200/60 bg-white/50 backdrop-blur-sm shadow-sm dark:border-zinc-800/60 dark:bg-zinc-900/30">
        <div className="p-4 border-b border-slate-200/60 dark:border-zinc-800/60">
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="p-0">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 border-b border-slate-100 last:border-0 dark:border-zinc-800/40">
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200/60 bg-white shadow-xl shadow-slate-200/20 dark:border-zinc-800/60 dark:bg-zinc-950 dark:shadow-none overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50/50 dark:bg-zinc-900/50">
          <TableRow className="hover:bg-transparent border-b border-slate-200/60 dark:border-zinc-800/60">
            {columns.map((column, idx) => (
              <TableHead
                key={column.accessorKey ? String(column.accessorKey) : `col-${idx}`}
                className="h-12 px-6 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70"
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-32 text-center text-muted-foreground">
                <div className="flex flex-col items-center justify-center gap-2">
                  <span className="text-sm font-medium">No records found</span>
                  <span className="text-xs">Your data will appear here once available.</span>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, rowIndex) => (
              <TableRow
                key={rowIndex}
                className="group border-b border-slate-100 last:border-0 hover:bg-slate-50/80 dark:border-zinc-800/40 dark:hover:bg-zinc-900/40 transition-colors duration-200"
              >
                {columns.map((column, colIdx) => (
                  <TableCell
                    key={column.accessorKey ? String(column.accessorKey) : `cell-${colIdx}`}
                    className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-zinc-300 group-hover:text-foreground transition-colors"
                  >
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


