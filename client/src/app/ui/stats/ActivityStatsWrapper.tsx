"use client";

import dynamic from "next/dynamic";

import { Activity } from "@/lib/schema";

import { StatsMapSkeleton } from "../skeletons";

const ActivityStats = dynamic(() => import("./ActivityStats"), {
  ssr: false,
  loading: () => <StatsMapSkeleton />,
});

export default function ActivityStatsWrapper({
  activityList,
}: {
  activityList: Activity[];
}) {
  return <ActivityStats activityList={activityList} />;
}
