"use client";

import { memo, useEffect, useRef } from "react";
import { Polyline } from "react-leaflet";
import { PointStats } from "@/types/activity";

import L from "leaflet";
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
      if (status === "hovered") borderRef.current?.bringToFront();
    }, [status]);

    const segments = points.map((point, i) =>
      i > 0
        ? ([
            [points[i - 1]!.lat, points[i - 1]!.lng],
            [point.lat, point.lng],
          ] as [[number, number], [number, number]])
        : null,
    );

    return (
      <>
        <Polyline
          key={`border-${points[0]!.id}`}
          renderer={canvas}
          positions={segments.flatMap((s) => s || [])}
          weight={status === "dimmed" ? 3 : 6}
          pathOptions={{
            color: "gray",
            opacity: status === "dimmed" ? 0.3 : 1,
          }}
        />
        {segments.map((pos, i) =>
          pos ? (
            <span key={points[i]!.id}>
              <Polyline
                ref={borderRef}
                key={`highlight-${points[i]!.id}`}
                renderer={canvas}
                positions={pos}
                weight={status === "dimmed" ? 2 : 5}
                pathOptions={{
                  opacity: status === "dimmed" ? 0.3 : 1,
                  color:
                    status === "dimmed"
                      ? "white"
                      : String(
                          points[i][
                            (heatMapField.field + "Color") as keyof PointStats
                          ],
                        ),
                }}
              />
            </span>
          ) : null,
        )}
      </>
    );
  },
);

export default ActivityPolylines;
