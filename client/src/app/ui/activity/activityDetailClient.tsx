"use client";

import { useState, useCallback, useMemo } from "react";
import type { Point } from "@/lib/schema";
import ActivityMapWrapper from "./activityMapWrapper";
import DataChart from "./dataChart";

export default function ActivityDetailClient({ points }: { points: Point[] }) {
  const [hoveredPoint, setHoveredPoint] = useState<Point | null>(null);
  const handleHover = useCallback(
    (point: Point | null) => setHoveredPoint(point),
    [],
  );
  const data = useMemo(
    () =>
      points.map((p, i) => {
        return {
          ...p,
          cumDist: parseFloat((p.cumDist / 1000).toFixed(2)),
          speed: Math.round(p.speed),
          ele: Math.round(p.ele * 1000),
          index: i,
        };
      }),
    [points],
  );

  return (
    <>
      <ActivityMapWrapper
        points={[data]}
        hoveredPoint={hoveredPoint}
        onHover={handleHover}
      />
      <DataChart
        data={data}
        onHover={handleHover}
        hoveredPoint={hoveredPoint}
        dataKey="ele"
        unit="m"
      />
      <DataChart
        data={data}
        onHover={handleHover}
        hoveredPoint={hoveredPoint}
        dataKey="speed"
        unit="km/h"
      />
    </>
  );
}
