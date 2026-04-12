"use client";

import { useCallback } from "react";
import { MapContainer, TileLayer, Polyline, CircleMarker } from "react-leaflet";
import type { PointStats } from "@/types/activity";
import "leaflet/dist/leaflet.css";
import { LeafletMouseEvent } from "leaflet";
import L from "leaflet";
const canvas = L.canvas({ padding: 0.5 });

export default function ActivityMap({
  onHover,
  pointList,
  hoveredPoint,
}: {
  onHover: (point: PointStats | null) => void;
  pointList: PointStats[];
  hoveredPoint?: PointStats | null;
}) {
  const handleMouseMove = useCallback(
    (e: LeafletMouseEvent) => {
      const closest = pointList.reduce(
        (best, p, i) => {
          const d = e.latlng.distanceTo([p.lat, p.lng]);
          return d < best.d ? { d, p } : best;
        },
        { d: Infinity, p: null as PointStats | null },
      );
      onHover(closest.p);
    },
    [onHover, pointList],
  );

  return (
    <MapContainer
      style={{ height: 600, width: "100%" }}
      bounds={pointList.map((p) => [p.lat, p.lng])}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {pointList.length > 0 &&
        pointList.map((p, j) => {
          if (j === 0) {
            return null; // skip first point to avoid zero-length segment
          }

          return (
            <Polyline
              key={p.id}
              renderer={canvas}
              positions={[pointList[j - 1], p]}
              color={p.speedColor}
              weight={3}
            />
          );
        })}
      <Polyline
        positions={pointList}
        color="transparent"
        weight={20}
        eventHandlers={{
          mousemove: handleMouseMove,
        }}
      />

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
