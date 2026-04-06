"use client";

import { useRef } from "react";
import { columns } from "./Columns";
import { usePaginatedScroll } from "../../hooks/usePaginatedScroll";
import { RowSkeleton } from "../skeletons";
import ActivityFilters from "./ActivityFilters";
import { Activity } from "@/lib/schema";
import { useMutationState } from "@tanstack/react-query";
import { DataTable } from "./DataTable";
import BulkActionBar from "./BulkActionBar";

export default function ActivityList({
  initialActivityList,
}: {
  initialActivityList: Activity[];
}) {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { allItems, isFetchingNextPage, error, isLoading } =
    usePaginatedScroll<Activity>(initialActivityList, loadMoreRef);

  const isPendingUpload =
    useMutationState({
      filters: {
        mutationKey: ["uploadActivity"],
        status: "pending",
      },
    }).length > 0;

  return (
    <>
      <ActivityFilters />
      <BulkActionBar />
      <div className="w-full">
        <DataTable
          columns={columns}
          data={allItems}
          isPendingUpload={isPendingUpload}
          isLoading={isLoading}
          isFetchingNextPage={isFetchingNextPage}
        />

        <div ref={loadMoreRef} />
      </div>
    </>
  );
}
