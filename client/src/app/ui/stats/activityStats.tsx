"use client";

import ActivityMapWrapper from "@/app/ui/activity/activityMapWrapper";
import { Activity, Point } from "@/lib/schema";
import { points } from "@turf/turf";
import { actionAsyncStorage } from "next/dist/server/app-render/action-async-storage.external";
import { useCallback, useMemo, useState } from "react";

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

  return (
    <ActivityMapWrapper
      points={data}
      onHover={handleHover}
      hoveredPoint={hoveredPoint}
    />
  );
}
