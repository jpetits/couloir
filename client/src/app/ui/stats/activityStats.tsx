"use client";

import ActivityMapWrapper from "@/app/ui/activity/ActivityMapWrapper";
import { Activity, Point } from "@/lib/schema";
import { useCallback, useMemo, useState } from "react";
import DataChart from "../activity/DataChart";
import { stat } from "node:fs";

export default function ActivityStats({ stats }: { stats: any }) {
  const [hoveredPoint, setHoveredPoint] = useState<Point | null>(null);
  const handleHover = useCallback(
    (point: Point | null) => setHoveredPoint(point),
    [],
  );

  const data = useMemo(
    () =>
      stats.activityList.map((a: Activity) =>
        (a.points ?? []).map((p: Point, i: number) => ({
          ...p,
          cumDist: parseFloat((p.cumDist / 1000).toFixed(2)),
          speed: Math.round(p.speed),
          ele: Math.round(p.ele * 1000),
          lat: p.lat,
          lng: p.lng,
          index: i,
        })),
      ),
    [stats.activityList],
  );

  const hoveredActivityPoints = useMemo(
    () =>
      hoveredPoint
        ? data.find(
            (points: Point[]) =>
              points.length > 0 &&
              points[0].activityId === hoveredPoint.activityId,
          )
        : [],
    [hoveredPoint, data],
  );

  return (
    <>
      <ActivityMapWrapper
        points={data}
        onHover={handleHover}
        hoveredPoint={hoveredPoint}
      />
      <DataChart
        data={hoveredActivityPoints}
        onHover={handleHover}
        hoveredPoint={hoveredPoint}
        dataKey="ele"
        unit="m"
      />
      <DataChart
        data={hoveredActivityPoints}
        onHover={handleHover}
        hoveredPoint={hoveredPoint}
        dataKey="speed"
        unit="km/h"
      />
    </>
  );
}
