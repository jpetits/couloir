"use client";

import { memo } from "react";
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
    return (
      <>
        {points.map((point, i) =>
          i > 0 ? (
            <Polyline
              key={point.id}
              renderer={canvas}
              positions={[
                [points[i - 1]!.lat, points[i - 1]!.lng],
                [point.lat, point.lng],
              ]}
              weight={status === "dimmed" ? 2 : 4}
              pathOptions={{
                opacity: status === "dimmed" ? 0.1 : 1,
                color:
                  status === "dimmed"
                    ? "gray"
                    : String(
                        point[
                          (heatMapField.field + "Color") as keyof PointStats
                        ],
                      ),
              }}
            />
          ) : null,
        )}
      </>
    );
  },
);

export default ActivityPolylines;
