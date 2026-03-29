"use client";

import { use, useCallback, useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";
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

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) map.fitBounds(positions);
  }, [map, positions]);
  return null;
}

export default function ActivityMap({
  onHover,
  points,
  hoveredIndex,
}: {
  onHover: (index: number | null) => void;
  points: Point[];
  hoveredIndex?: number | null;
}) {
  const hoveredPoint = hoveredIndex != null ? points[hoveredIndex] : null;
  const positions = points.map((p) => [p.lat, p.lng] as [number, number]);

  const handleMouseMove = useCallback(
    (e: LeafletMouseEvent) => {
      const closest = points.reduce(
        (best, p, i) => {
          const d = e.latlng.distanceTo([p.lat, p.lng]);
          return d < best.d ? { d, i } : best;
        },
        { d: Infinity, i: 0 },
      );
      onHover(closest.i);
    },
    [onHover, points],
  );

  return (
    <MapContainer
      style={{ height: 600, width: "100%" }}
      center={positions[0] ?? [0, 0]}
      zoom={13}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Polyline positions={positions} color="#3b82f6" weight={3} />
      <Polyline
        positions={positions}
        color="transparent"
        weight={20}
        eventHandlers={{
          mousemove: handleMouseMove,
        }}
      />
      <FitBounds positions={positions} />
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
