"use client";

import { useRef } from "react";
import { columns } from "./columns";
import { usePaginatedScroll } from "../../hooks/usePaginatedScroll";
import { ActivityListSkeleton } from "../skeletons";
import { Activity } from "@/lib/schema";
import { useMutationState } from "@tanstack/react-query";
import { DataTable } from "./dataTable";

export default function ActivityList({
  initialActivityList,
  fetchMorePath,
}: {
  initialActivityList: Activity[];
  fetchMorePath: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const { allItems, isFetchingNextPage, error } = usePaginatedScroll<Activity>(
    initialActivityList,
    fetchMorePath,
    ref,
  );

  const isPendingUpload =
    useMutationState({
      filters: {
        mutationKey: ["uploadActivity"],
        status: "pending",
      },
    }).length > 0;

  return (
    <div className="flex flex-row">
      <DataTable
        columns={columns}
        data={allItems}
        isPendingUpload={isPendingUpload}
      />

      <div ref={ref} />
      {isFetchingNextPage && !error && <ActivityListSkeleton />}
    </div>
  );
}
