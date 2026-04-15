"use client";

import { useCallback, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import type { Activity, Point } from "@/lib/schema";
import { enrichPointList } from "@/lib/utils";
import type { PointStats } from "@/types/activity";

import Map3DView from "../stats/Map3DView";
import ActivityMapWrapper from "./ActivityMapWrapper";
import DataChart from "./DataChart";

export default function ActivityDetailClient({
  activity,
}: {
  activity: Activity & { points: Point[] };
}) {
  const [hoveredPoint, setHoveredPoint] = useState<PointStats | null>(null);
  const handleHover = useCallback(
    (point: PointStats | null) => setHoveredPoint(point),
    [],
  );

  const enrichedPoints = useMemo(
    () => enrichPointList(activity.points, activity),
    [activity],
  );
  const [show3D, setShow3D] = useState(false);

  return (
    <>
      <Button
        className="mb-5 cursor-pointer"
        onClick={() => setShow3D((s) => !s)}
      >
        {show3D ? "Masquer la vue 3D" : "Afficher la vue 3D"}
      </Button>
      <div className={`${show3D ? "hidden" : ""}`}>
        <ActivityMapWrapper
          pointList={enrichedPoints}
          hoveredPoint={hoveredPoint}
          onHover={handleHover}
        />
      </div>
      <div className={`${show3D ? "" : "hidden"}`}>
        <Map3DView
          visible={show3D}
          activityList={[{ id: activity.id, points: enrichedPoints }]}
        />
      </div>
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
