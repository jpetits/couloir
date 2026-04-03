"use client";

import { useRef } from "react";
import { columns } from "./columns";
import { usePaginatedScroll } from "../../hooks/usePaginatedScroll";
import { ActivityListSkeleton } from "../skeletons";
import ActivityFilters from "./activityFilters";
import { Activity } from "@/lib/schema";
import { useMutationState } from "@tanstack/react-query";
import { DataTable } from "./dataTable";

export default function ActivityList({
  initialActivityList,
}: {
  initialActivityList: Activity[];
}) {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { allItems, isFetchingNextPage, error } = usePaginatedScroll<Activity>(
    initialActivityList,
    loadMoreRef,
  );

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
      <div className="flex flex-row">
        <DataTable
          columns={columns}
          data={allItems}
          isPendingUpload={isPendingUpload}
        />

        <div ref={loadMoreRef} />
        {isFetchingNextPage && !error && <ActivityListSkeleton />}
      </div>
    </>
  );
}
