"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Polyline, useMap } from "react-leaflet";
import simplify from "@turf/simplify";
import { lineString } from "@turf/helpers";
import type { Point } from "@/lib/schema";
import "leaflet/dist/leaflet.css";

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) map.fitBounds(positions);
  }, [map, positions]);
  return null;
}

export default function ActivityMap({ points }: { points: Point[] }) {
  const line = lineString(points.map((p) => [p.lng, p.lat]));
  const simplified = simplify(line, { tolerance: 0.0001, highQuality: false });
  const positions = simplified.geometry.coordinates.map(
    ([lng, lat]) => [lat, lng] as [number, number],
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
      <FitBounds positions={positions} />
    </MapContainer>
  );
}
