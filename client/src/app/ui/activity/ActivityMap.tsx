"use client";

import { useCallback, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  useMap,
  CircleMarker,
} from "react-leaflet";
import type { PointStats } from "@/types/activity";
import "leaflet/dist/leaflet.css";
import { LeafletMouseEvent } from "leaflet";

function FitBounds({ positions }: { positions: PointStats[][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = positions
        .flat()
        .map((p) => [p.lat, p.lng] as [number, number]);
      map.fitBounds(bounds);
    }
  }, []);
  return null;
}

export default function ActivityMap({
  onHover,
  points,
  hoveredPoint,
}: {
  onHover: (point: PointStats | null) => void;
  points: PointStats[][];
  hoveredPoint?: PointStats | null;
}) {
  const handleMouseMove = useCallback(
    (e: LeafletMouseEvent) => {
      const closest = points.flat().reduce(
        (best, p, i) => {
          const d = e.latlng.distanceTo([p.lat, p.lng]);
          return d < best.d ? { d, p } : best;
        },
        { d: Infinity, p: null as PointStats | null },
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
              {pos.map((p, j) => {
                if (j === 0) {
                  return null; // skip first point to avoid zero-length segment
                }

                return (
                  <Polyline
                    key={p.id}
                    positions={[pos[j - 1], p]}
                    color={p.speedColor}
                    weight={3}
                  />
                );
              })}

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
