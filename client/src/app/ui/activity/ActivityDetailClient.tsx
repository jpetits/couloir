"use client";

import { useState, useCallback } from "react";
import type { Point } from "@/lib/schema";
import type { PointStats } from "@/types/activity";
import ActivityMapWrapper from "./ActivityMapWrapper";
import DataChart from "./DataChart";
import { enrichedPointList } from "@/lib/utils";

export default function ActivityDetailClient({
  pointList,
}: {
  pointList: Point[];
}) {
  const [hoveredPoint, setHoveredPoint] = useState<PointStats | null>(null);
  const handleHover = useCallback(
    (point: PointStats | null) => setHoveredPoint(point),
    [],
  );

  const enrichedPoints = enrichedPointList(pointList);

  return (
    <>
      <ActivityMapWrapper
        pointList={enrichedPoints}
        hoveredPoint={hoveredPoint}
        onHover={handleHover}
      />
      <DataChart
        pointList={enrichedPoints}
        onHover={handleHover}
        hoveredPoint={hoveredPoint}
        dataKey="ele"
        unit="m"
      />
      <DataChart
        pointList={enrichedPoints}
        onHover={handleHover}
        hoveredPoint={hoveredPoint}
        dataKey="speed"
        unit="km/h"
      />
    </>
  );
}
