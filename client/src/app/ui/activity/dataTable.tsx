"use client";

import { Activity } from "@/lib/schema";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import DeleteDialog from "../modal/deleteDialog";
import { useDeleteActivity } from "@/app/hooks/useDeleteActivity";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isPendingUpload?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isPendingUpload,
}: DataTableProps<TData, TValue>) {
  const [selectedActivityToDelete, setSelectedActivityToDelete] =
    useState<Activity | null>(null);
  const table = useReactTable({
    data,
    columns,
    meta: {
      onDelete: (activity: Activity) => setSelectedActivityToDelete(activity),
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const { mutate: deleteActivity } = useDeleteActivity();

  return (
    <div className="w-full mt-5">
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
            {isPendingUpload && (
              <TableRow>
                {columns.map((_, i) => (
                  <TableCell key={i}>
                    <div className="h-4 rounded bg-muted animate-pulse" />
                  </TableCell>
                ))}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
      {selectedActivityToDelete && (
        <DeleteDialog
          display={!!selectedActivityToDelete}
          onDelete={() => {
            deleteActivity(selectedActivityToDelete.id);
            setSelectedActivityToDelete(null);
          }}
          onCancel={() => setSelectedActivityToDelete(null)}
        />
      )}
    </div>
  );
}
