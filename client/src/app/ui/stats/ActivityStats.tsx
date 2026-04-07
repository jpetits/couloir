"use client";

import ActivityMapWrapper from "@/app/ui/activity/ActivityMapWrapper";
import { Activity, Point } from "@/lib/schema";
import { useCallback, useMemo, useState } from "react";
import DataChart from "../activity/DataChart";
import ActivityName from "../activity/ActivityName";
import { formatDuration } from "@/lib/utils";

export default function ActivityStats({
  activityList,
}: {
  activityList: Activity[];
}) {
  const [hoveredPoint, setHoveredPoint] = useState<Point | null>(null);
  const handleHover = useCallback(
    (point: Point | null) => setHoveredPoint(point),
    [],
  );

  const data = useMemo(
    () =>
      activityList.map((a: Activity) =>
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
    [activityList],
  );

  const hoveredActivityPoints = useMemo(
    () =>
      hoveredPoint
        ? (data.find(
            (points: Point[]) =>
              points.length > 0 &&
              points[0].activityId === hoveredPoint.activityId,
          ) ?? [])
        : [],
    [hoveredPoint, data],
  );

  const hoveredActivity = activityList.find(
    (a: Activity) => a.id === hoveredPoint?.activityId,
  );

  return (
    <div className="flex flex-col gap-1 mt-3">
      <ActivityMapWrapper
        points={data}
        onHover={handleHover}
        hoveredPoint={hoveredPoint}
      />

      {hoveredActivity && (
        <>
          <ActivityName activity={hoveredActivity} />
          <div className="flex gap-4">
            <div>
              {hoveredActivity.date} {hoveredActivity.distance / 1000} km{" "}
            </div>
            <div>{hoveredActivity.elevGain} d+ </div>
            <div>{formatDuration(hoveredActivity.duration, false)}</div>
          </div>
        </>
      )}

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
    </div>
  );
}
