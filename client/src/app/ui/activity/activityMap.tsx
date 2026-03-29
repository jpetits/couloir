"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  useMap,
  CircleMarker,
} from "react-leaflet";
import type { Point } from "@/lib/schema";
import "leaflet/dist/leaflet.css";

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) map.fitBounds(positions);
  }, [map, positions]);
  return null;
}

export default function ActivityMap({
  points,
  hoveredIndex,
}: {
  points: Point[];
  hoveredIndex?: number | null;
}) {
  const hoveredPoint = hoveredIndex != null ? points[hoveredIndex] : null;
  const positions = points.map((p) => [p.lat, p.lng] as [number, number]);

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
