"use client";

import dynamic from "next/dynamic";
import type { PointStats } from "@/types/activity";

const ActivityMap = dynamic(() => import("./ActivityMap"), { ssr: false });

export default function ActivityMapWrapper({
  points,
  hoveredPoint,
  onHover,
}: {
  points: PointStats[][];
  hoveredPoint?: PointStats | null;
  onHover: (point: PointStats | null) => void;
}) {
  return (
    <ActivityMap
      points={points}
      hoveredPoint={hoveredPoint}
      onHover={onHover}
    />
  );
}
