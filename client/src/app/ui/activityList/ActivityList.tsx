"use client";

import { useEffect, useRef } from "react";

import { useMutationState } from "@tanstack/react-query";
import {
  useRouter,
  useSearchParams,
} from "next/dist/client/components/navigation";

import { stravaConnect } from "@/lib/dataClient";
import { Activity } from "@/lib/schema";
import { useActivitySelectionStore } from "@/store/activitySelection";

import { useApi } from "../../hooks/useApi";
import { usePaginatedScroll } from "../../hooks/usePaginatedScroll";
import ActivityFilters from "../activity/ActivityFilters";
import BulkActionBar from "../activity/BulkActionBar";
import { columns } from "../activity/Columns";
import { DataTable } from "../activity/DataTable";

export default function ActivityList({
  initialActivityList,
}: {
  initialActivityList: Activity[];
}) {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const apiFetch = useApi();

  const { allItems, isFetchingNextPage, isLoading } =
    usePaginatedScroll<Activity>(initialActivityList, loadMoreRef);

  const retainOnly = useActivitySelectionStore((state) => state.retainOnly);

  useEffect(() => {
    retainOnly(allItems.map((a) => a.id));
  }, [allItems, retainOnly]);

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) return;

    stravaConnect(apiFetch, code).then(() => {
      // Clear the code param from the URL after handling it
      const params = new URLSearchParams(searchParams);
      params.delete("code");
      params.delete("scope");
      params.delete("state");
      router.replace(`?${params.toString()}`);
    });
  }, [searchParams]);

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
