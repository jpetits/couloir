"use client";

import { memo, useEffect, useRef } from "react";
import { Polyline } from "react-leaflet";

import L from "leaflet";

import { useZoom } from "@/app/hooks/useLeaflet";
import { getPointColor, getSegmentsFromPoints } from "@/lib/utils";
import { PointStats } from "@/types/activity";

type HoverStatus = "hovered" | "dimmed" | "idle";

const Map2DPolylines = memo(
  ({
    points,
    status,
    heatMapField,
  }: {
    points: PointStats[];
    status: HoverStatus;
    heatMapField: { field: keyof PointStats; unit: string };
  }) => {
    const zoom = useZoom();
    const canvasRef = useRef<L.Canvas | null>(null);
    if (!canvasRef.current) canvasRef.current = L.canvas({ padding: 0.5 });
    const canvas = canvasRef.current;
    const borderRef = useRef<L.Polyline>(null);
    useEffect(() => {
      if (status === "hovered") borderRef.current?.bringToFront(); //leaflet doesn't handle z-index on canvas layers, so we need to manually bring the hovered polyline to front
    }, [status]);

    const segments = getSegmentsFromPoints(points);

    return (
      <>
        {zoom < 14 && (
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
        )}
        {segments.map((pos, i) => (
          <Polyline
            ref={borderRef}
            key={`highlight-${points[i]!.id}`}
            renderer={canvas}
            positions={pos}
            weight={status === "dimmed" ? 2 : 5}
            pathOptions={{
              opacity: status === "dimmed" ? 0.3 : 1,
              color: getPointColor(points[i], heatMapField, status),
            }}
          />
        ))}
      </>
    );
  },
);

export default Map2DPolylines;
