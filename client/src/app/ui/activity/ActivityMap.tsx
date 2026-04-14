"use client";

import { useCallback } from "react";
import { CircleMarker, MapContainer, Polyline, TileLayer } from "react-leaflet";

import L, { LeafletMouseEvent } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTheme } from "next-themes";

import type { PointStats } from "@/types/activity";

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
  const { resolvedTheme } = useTheme();
  const handleMouseMove = useCallback(
    (e: LeafletMouseEvent) => {
      const closest = pointList.reduce(
        (best, p) => {
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
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
        url={
          resolvedTheme === "dark"
            ? "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key=${process.env.NEXT_PUBLIC_STADIA_API_KEY}"
            : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        }
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
