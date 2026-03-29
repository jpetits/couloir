"use client";

import { useState, useCallback } from "react";
import type { Point } from "@/lib/schema";
import ActivityMapWrapper from "./activityMapWrapper";
import DataChart from "./dataChart";

export default function ActivityDetailClient({ points }: { points: Point[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const handleHover = useCallback(
    (index: number | null) => setHoveredIndex(index),
    [],
  );
  const data = points.map((p, i) => {
    return {
      cumDist: parseFloat((p.cumDist / 1000).toFixed(2)),
      speed: Math.round(p.speed),
      ele: Math.round(p.ele * 1000),
      index: i,
    };
  });

  return (
    <>
      <ActivityMapWrapper
        points={points}
        hoveredIndex={hoveredIndex}
        onHover={handleHover}
      />
      <DataChart
        data={data}
        onHover={handleHover}
        hoveredIndex={hoveredIndex}
        dataKey="ele"
        unit="m"
      />
      <DataChart
        data={data}
        onHover={handleHover}
        hoveredIndex={hoveredIndex}
        dataKey="speed"
        unit="km/h"
      />
    </>
  );
}
