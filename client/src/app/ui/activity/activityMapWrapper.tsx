"use client";

import dynamic from "next/dynamic";
import type { Point } from "@/lib/schema";

const ActivityMap = dynamic(() => import("./activityMap"), { ssr: false });

export default function ActivityMapWrapper({
  points,
  hoveredIndex,
  onHover,
}: {
  points: Point[];
  hoveredIndex?: number | null;
  onHover: (index: number | null) => void;
}) {
  return <ActivityMap points={points} hoveredIndex={hoveredIndex} onHover={onHover} />;
}
