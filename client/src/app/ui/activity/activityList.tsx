"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRef } from "react";
import ActivityTile from "./activityTile";
import { usePaginatedScroll } from "../../hooks/usePaginatedScroll";
import { ActivityListSkeleton, ActivityTileSkeleton } from "../skeletons";
import { Activity } from "@/lib/schema";
import { useMutationState } from "@tanstack/react-query";

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

  const isPendingUpload =
    useMutationState({
      filters: {
        mutationKey: ["uploadActivity"],
        status: "pending",
      },
    }).length > 0;

  return (
    <div className="flex flex-row">
      <Table>
        <TableCaption>A list of your recent invoices.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Date</TableHead>
            <TableHead>Distance</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Dénivelé</TableHead>
            <TableHead className="text-right">Vitesse moy</TableHead>
            <TableHead className="text-right">Vitesse max</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.pages.map((page, pageIndex) => (
            <TableRow key={pageIndex} className="">
              {page.map((activity: Activity) => (
                <ActivityTile key={activity.id} activity={activity} />
              ))}

              {isPendingUpload && <ActivityTileSkeleton />}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div ref={ref} />
      {isFetchingNextPage && !error && <ActivityListSkeleton />}
      {!isFetchingNextPage && data.pages[0].length === 0 && (
        <p className="mt-12 text-center text-zinc-400">No activities found.</p>
      )}
    </div>
  );
}
