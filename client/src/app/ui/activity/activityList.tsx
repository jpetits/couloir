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

  const { data, allItems, isFetchingNextPage, error } =
    usePaginatedScroll<Activity>(initialActivityList, fetchMorePath, ref);

  const isPendingUpload =
    useMutationState({
      filters: {
        mutationKey: ["uploadActivity"],
        status: "pending",
      },
    }).length > 0;

  return (
    <div className="flex flex-row">
      <DataTable columns={columns} data={allItems} />

      <div ref={ref} />
      {isFetchingNextPage && !error && <ActivityListSkeleton />}
      {!isFetchingNextPage && data.pages[0].length === 0 && (
        <p className="mt-12 text-center text-zinc-400">No activities found.</p>
      )}
    </div>
  );
}
