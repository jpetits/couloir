"use client";

import { useCallback, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  useMap,
  CircleMarker,
} from "react-leaflet";
import type { Point } from "@/lib/schema";
import "leaflet/dist/leaflet.css";
import { LeafletMouseEvent } from "leaflet";
import { activityColor } from "@/lib/utils";

function FitBounds({ positions }: { positions: Point[][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = positions
        .flat()
        .map((p) => [p.lat, p.lng] as [number, number]);
      map.fitBounds(bounds);
    }
  }, [map, positions]);
  return null;
}

export default function ActivityMap({
  onHover,
  points,
  hoveredPoint,
}: {
  onHover: (point: Point | null) => void;
  points: Point[][];
  hoveredPoint?: Point | null;
}) {
  const handleMouseMove = useCallback(
    (e: LeafletMouseEvent) => {
      const closest = points.flat().reduce(
        (best, p, i) => {
          const d = e.latlng.distanceTo([p.lat, p.lng]);
          return d < best.d ? { d, p } : best;
        },
        { d: Infinity, p: null as Point | null },
      );
      onHover(closest.p);
    },
    [onHover, points],
  );

  return (
    <MapContainer
      style={{ height: 600, width: "100%" }}
      center={points[0][0] ?? [0, 0]}
      zoom={13}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {points.length > 0 &&
        points
          .filter((pos) => pos.length > 0)
          .map((pos, i) => (
            <div key={i}>
              <Polyline
                positions={pos}
                color={activityColor(pos[0].activityId)}
                weight={3}
              />
              <Polyline
                positions={pos}
                color="transparent"
                weight={20}
                eventHandlers={{
                  mousemove: handleMouseMove,
                }}
              />
            </div>
          ))}
      <FitBounds positions={points} />
      {hoveredPoint && (
        <CircleMarker
          center={[hoveredPoint.lat, hoveredPoint.lng]}
          radius={8}
          pathOptions={{
            color: "#fff",
            fillColor: "#3b82f6",
            fillOpacity: 1,
            weight: 2,
          }}
        />
      )}
    </MapContainer>
  );
}
