"use client";

import dynamic from "next/dynamic";
import type { Point } from "@/lib/schema";

const ActivityMap = dynamic(() => import("./ActivityMap"), { ssr: false });

export default function ActivityMapWrapper({
  points,
  hoveredPoint,
  onHover,
}: {
  points: Point[][];
  hoveredPoint?: Point | null;
  onHover: (point: Point | null) => void;
}) {
  return (
    <ActivityMap
      points={points}
      hoveredPoint={hoveredPoint}
      onHover={onHover}
    />
  );
}
