"use client";

import dynamic from "next/dynamic";
import type { Point } from "@/lib/schema";

const ActivityMap = dynamic(() => import("./activityMap"), { ssr: false });

export default function ActivityMapWrapper({
  points,
  hoveredIndex,
}: {
  points: Point[];
  hoveredIndex?: number | null;
}) {
  return <ActivityMap points={points} hoveredIndex={hoveredIndex} />;
}
