"use client";

import dynamic from "next/dynamic";
import type { PointStats } from "@/types/activity";

const ActivityMap = dynamic(() => import("./ActivityMap"), { ssr: false });

export default function ActivityMapWrapper({
  pointList,
  hoveredPoint,
  onHover,
}: {
  pointList: PointStats[];
  hoveredPoint?: PointStats | null;
  onHover: (point: PointStats | null) => void;
}) {
  return (
    <ActivityMap
      pointList={pointList}
      hoveredPoint={hoveredPoint}
      onHover={onHover}
    />
  );
}
