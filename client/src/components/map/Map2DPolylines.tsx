"use client";

import { memo, useEffect, useRef } from "react";
import { Polyline } from "react-leaflet";

import L from "leaflet";
import { useTheme } from "next-themes";

import { getPointColor, getSegmentsFromPoints } from "@/lib/utils";
import { useMapStore } from "@/store/mapStore";
import { PointStats } from "@/types/activity";

type HoverStatus = "hovered" | "dimmed" | "idle";

const canvas = L.canvas({ padding: 0.5 });

const Map2DPolylines = memo(
  ({ points, status }: { points: PointStats[]; status: HoverStatus }) => {
    const { resolvedTheme } = useTheme();
    const borderRef = useRef<L.Polyline>(null);
    const selectedActivityId = useMapStore((state) => state.selectedActivityId);
    const heatMapField = useMapStore((state) => state.heatMapField);
    useEffect(() => {
      if (status === "hovered") borderRef.current?.bringToFront();
    }, [status]);

    const segments = getSegmentsFromPoints(points);

    const hasSelected = selectedActivityId;
    const isSelected =
      !!selectedActivityId && selectedActivityId === points[0]?.activityId;
    const active = (status === "hovered" && !hasSelected) || isSelected;

    return (
      <>
        {active ? (
          segments.map((pos, i) => (
            <Polyline
              ref={borderRef}
              renderer={canvas}
              key={`highlight-${points[i]!.id}`}
              positions={pos}
              weight={5}
              pathOptions={{
                opacity: 1,
                color: getPointColor(points[i], heatMapField),
              }}
            />
          ))
        ) : (
          <Polyline
            ref={borderRef}
            renderer={canvas}
            key={`highlight-${points[0]!.id}`}
            positions={segments.flatMap((s) => s || [])}
            weight={status === "hovered" ? 5 : 4}
            pathOptions={{
              opacity: status === "hovered" ? 0.7 : 0.3,
              color: resolvedTheme === "dark" ? "grey" : "#423f3e",
            }}
          />
        )}
      </>
    );
  },
);

export default Map2DPolylines;
