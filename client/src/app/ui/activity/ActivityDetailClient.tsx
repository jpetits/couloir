"use client";

import { useState, useCallback } from "react";
import type { Activity } from "@/lib/schema";
import type { PointStats } from "@/types/activity";
import ActivityMapWrapper from "./ActivityMapWrapper";
import DataChart from "./DataChart";
import { enrichPointList } from "@/lib/utils";

export default function ActivityDetailClient({
  activity,
}: {
  activity: Activity;
}) {
  const [hoveredPoint, setHoveredPoint] = useState<PointStats | null>(null);
  const handleHover = useCallback(
    (point: PointStats | null) => setHoveredPoint(point),
    [],
  );

  const enrichedPoints = enrichPointList(activity.points!, activity);

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
        dataKey="elevation"
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
