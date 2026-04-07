"use client";

import React from "react";
import { Activity } from "@/lib/schema";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useState } from "react";
import DeleteDialog from "@/app/ui/modal/DeleteDialog";
import { useDeleteActivity } from "@/app/hooks/useDeleteActivity";
import {
  useRouter,
  useSearchParams,
} from "next/dist/client/components/navigation";
import { RowSkeleton } from "../skeletons";
import { useActivitySelectionStore } from "@/store/activitySelection";
import { useShallow } from "zustand/react/shallow";

export function DataTable<TData extends { id: string }, TValue>({
  columns,
  data,
  isPendingUpload,
  isLoading,
  isFetchingNextPage,
}: {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isPendingUpload?: boolean;
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
}) {
  const searchParms = useSearchParams();
  const router = useRouter();

  const [selectedActivityToDelete, setSelectedActivityToDelete] =
    useState<Activity | null>(null);

  const [sorting, setSorting] = useState<SortingState>(() => {
    const sort = searchParms.get("sortBy");
    const order = searchParms.get("sortOrder");
    return sort ? [{ id: sort, desc: order === "desc" }] : [];
  });

  const handleSortingChange = (
    updater: SortingState | ((prev: SortingState) => SortingState),
  ) => {
    const params = new URLSearchParams(searchParms.toString());
    const newSorting = updater instanceof Function ? updater(sorting) : updater;
    setSorting(newSorting);

    if (newSorting.length > 0) {
      params.set("sortBy", newSorting[0].id);
      params.set("sortOrder", newSorting[0].desc ? "desc" : "asc");
    } else {
      params.delete("sortBy");
      params.delete("sortOrder");
    }
    router.push(`?${params}`);
  };

  const [toggle, selected, toggleAll] = useActivitySelectionStore(
    useShallow((state) => [state.toggle, state.selected, state.toggleAll]),
  );

  const table = useReactTable({
    data,
    columns: React.useMemo(() => columns, [columns]),
    meta: {
      onDelete: (activity: Activity) => setSelectedActivityToDelete(activity),
      activityList: data,
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: handleSortingChange,
    state: {
      sorting,
    },
  });

  const { mutate: deleteActivity } = useDeleteActivity();

  return (
    <div className="w-full mt-5">
      <div className="overflow-hidden rounded-md border w-full">
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
                  data-state={selected.includes(row.original.id) && "selected"}
                  onClick={() => {
                    toggle(row.original.id);
                  }}
                  className="cursor-pointer"
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
            {isPendingUpload && <RowSkeleton rows={1} cells={columns.length} />}
            {(isLoading || isFetchingNextPage) && (
              <RowSkeleton rows={5} cells={columns.length} />
            )}
          </TableBody>
        </Table>
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
