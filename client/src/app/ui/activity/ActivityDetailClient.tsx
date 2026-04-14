"use client";

import { useCallback, useState } from "react";

import type { Activity } from "@/lib/schema";
import { enrichPointList } from "@/lib/utils";
import type { PointStats } from "@/types/activity";

import ActivityMapWrapper from "./ActivityMapWrapper";
import DataChart from "./DataChart";

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
      <div className="mt-5">
        <DataChart
          pointList={enrichedPoints}
          onHover={handleHover}
          hoveredPoint={hoveredPoint}
          dataKey="elevation"
          unit="m"
        />
      </div>
      <div className="mt-5">
        <DataChart
          pointList={enrichedPoints}
          onHover={handleHover}
          hoveredPoint={hoveredPoint}
          dataKey="speed"
          unit="km/h"
        />
      </div>
    </>
  );
}
