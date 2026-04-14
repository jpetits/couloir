"use client";

import dynamic from "next/dynamic";

import { Activity } from "@/lib/schema";

const ActivityStats = dynamic(() => import("./ActivityStats"), { ssr: false });

export default function ActivityStatsWrapper({
  activityList,
}: {
  activityList: Activity[];
}) {
  return <ActivityStats activityList={activityList} />;
}
