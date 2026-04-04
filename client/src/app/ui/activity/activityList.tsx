"use client";

import { useRef } from "react";
import { columns } from "./Columns";
import { usePaginatedScroll } from "../../hooks/usePaginatedScroll";
import { ActivityListSkeleton } from "../skeletons";
import ActivityFilters from "./ActivityFilters";
import { Activity } from "@/lib/schema";
import { useMutationState } from "@tanstack/react-query";
import { DataTable } from "./DataTable";

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
      <div className="w-full">
        <DataTable
          columns={columns}
          data={allItems}
          isPendingUpload={isPendingUpload}
        />

        <div ref={loadMoreRef} />
        {isFetchingNextPage && !error && <ActivityListSkeleton />}
        {isLoading && !isFetchingNextPage && !error && <ActivityListSkeleton />}
      </div>
    </>
  );
}
