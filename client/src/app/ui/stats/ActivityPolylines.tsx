"use client";

import { memo, useEffect, useRef } from "react";
import { Polyline } from "react-leaflet";

import L from "leaflet";

import { PointStats } from "@/types/activity";

const canvas = L.canvas({ padding: 0.5 });

type HoverStatus = "hovered" | "dimmed" | "idle";

const ActivityPolylines = memo(
  ({
    points,
    status,
    heatMapField,
  }: {
    points: PointStats[];
    status: HoverStatus;
    heatMapField: { field: keyof PointStats; unit: string };
  }) => {
    const borderRef = useRef<L.Polyline>(null);
    useEffect(() => {
      if (status === "hovered") borderRef.current?.bringToFront(); //leaflet doesn't handle z-index on canvas layers, so we need to manually bring the hovered polyline to front
    }, [status]);

    const segments = points.map(
      (point, i) =>
        i > 0
          ? ([
              [points[i - 1]!.lat, points[i - 1]!.lng],
              [point.lat, point.lng],
            ] as [[number, number], [number, number]])
          : ([[point.lat, point.lng]] as [[number, number]]), // for the first point, create a dummy segment to be able to color it based on speed/elevation/etc
    ); // create segments between points, as we want to color each segment based on the point's speed/elevation/etc, but Leaflet doesn't support coloring individual points in a single Polyline

    const getPointColor = (point: PointStats) => {
      if (status === "dimmed") {
        return "grey";
      }

      const colorField = (heatMapField.field + "Color") as keyof PointStats;
      return String(point[colorField]);
    };

    return (
      <>
        <Polyline
          key={`border-${points[0]!.id}`} //border polyline to create a contrast and make it more visible when hovered or dimmed
          renderer={canvas}
          positions={segments.flatMap((s) => s || [])}
          weight={status === "dimmed" ? 3 : 6}
          pathOptions={{
            color: "lightgray",
            opacity: status === "dimmed" ? 0.3 : 1,
          }}
        />
        {segments.map((pos, i) => (
          <Polyline
            ref={borderRef}
            key={`highlight-${points[i]!.id}`}
            renderer={canvas}
            positions={pos}
            weight={status === "dimmed" ? 2 : 5}
            pathOptions={{
              opacity: status === "dimmed" ? 0.3 : 1,
              color: getPointColor(points[i]),
            }}
          />
        ))}
      </>
    );
  },
);

export default ActivityPolylines;
