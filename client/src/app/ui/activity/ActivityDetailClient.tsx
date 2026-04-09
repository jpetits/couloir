"use client";

import { useState, useCallback, useMemo } from "react";
import type { Point } from "@/lib/schema";
import type { PointStats } from "@/types/activity";
import ActivityMapWrapper from "./ActivityMapWrapper";
import DataChart from "./DataChart";
import { colorInterpolate } from "@/lib/utils";

export default function ActivityDetailClient({ points }: { points: Point[] }) {
  const [hoveredPoint, setHoveredPoint] = useState<PointStats | null>(null);
  const handleHover = useCallback(
    (point: PointStats | null) => setHoveredPoint(point),
    [],
  );

  const { maxSpeed, minSpeed } = useMemo(() => {
    return {
      maxSpeed: Math.max(...points.map((p) => p.speed)),
      minSpeed: Math.min(...points.map((p) => p.speed)),
    };
  }, [points]);

  const data = useMemo(
    () =>
      points.map((p, i) => {
        return {
          ...p,
          cumDist: parseFloat((p.cumDist / 1000).toFixed(2)),
          speed: Math.round(p.speed),
          ele: Math.round(p.ele * 1000),
          index: i,
          speedColor: colorInterpolate(p.speed, minSpeed, maxSpeed),
        };
      }),
    [points, minSpeed, maxSpeed],
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
