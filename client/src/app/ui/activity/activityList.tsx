"use client";

import { useRef } from "react";
import ActivityTile from "./activityTile";
import { usePaginatedScroll } from "../../hooks/usePaginatedScroll";
import { ActivityListSkeleton } from "../skeletons";
import { Activity } from "@/lib/schema";

export default function ActivityList({
  initialActivityList,
  fetchMorePath,
}: {
  initialActivityList: Activity[];
  fetchMorePath: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const { data, isFetchingNextPage, error } = usePaginatedScroll<Activity>(
    initialActivityList,
    fetchMorePath,
    ref,
  );

  return (
    <div className="flex flex-col gap-3">
      {data.pages.map((page, pageIndex) => (
        <div
          key={pageIndex}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3"
        >
          {page.map((activity: Activity, index: number) => (
            <ActivityTile
              key={activity.id}
              activity={activity}
              priority={pageIndex === 0 && index < 6}
            />
          ))}
        </div>
      ))}
      <div ref={ref} />
      {isFetchingNextPage && !error && <ActivityListSkeleton />}
      {!isFetchingNextPage && data.pages[0].length === 0 && (
        <p className="mt-12 text-center text-zinc-400">No activities found.</p>
      )}
    </div>
  );
}
