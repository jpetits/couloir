"use client";

import { useMemo } from "react";
import Map, { Marker } from "react-map-gl/maplibre";

import "maplibre-gl/dist/maplibre-gl.css";
import { useShallow } from "zustand/react/shallow";

import { MAP_HEIGHT } from "@/lib/constants";
import type { ActivityWithPoints } from "@/store/mapStore";
import { useMapStore } from "@/store/mapStore";
import type { PointStats } from "@/types/activity";

import Map3DContent from "./Map3DContent";

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;

function nearestPoint(points: PointStats[], lng: number, lat: number) {
  let best: PointStats | null = null;
  let bestDist = Infinity;
  for (const p of points) {
    const d = (p.lng - lng) ** 2 + (p.lat - lat) ** 2;
    if (d < bestDist) {
      bestDist = d;
      best = p;
    }
  }
  return best;
}

export default function Map3DView({
  visible = true,
  activityList,
  hoveredPoint,
  onHover,
}: {
  visible?: boolean;
  activityList: ActivityWithPoints[];
  height?: string;
  hoveredPoint?: PointStats | null;
  onHover: (point: PointStats | null, activityId: string | null) => void;
}) {
  const {
    mapViewport,
    setSelectedActivityId,
    selectedActivityId,
    heatMapField,
  } = useMapStore(
    useShallow((s) => ({
      mapViewport: s.mapViewport,
      setSelectedActivityId: s.setSelectedActivityId,
      selectedActivityId: s.selectedActivityId,
      heatMapField: s.heatMapField,
    })),
  );

  const initialViewState = useMemo(() => {
    const points = activityList.flatMap((a) => a.points) ?? [];
    const lats = points.map((p) => p.lat);
    const lngs = points.map((p) => p.lng);
    const bounds =
      points.length > 0
        ? ([
            [Math.min(...lngs), Math.min(...lats)],
            [Math.max(...lngs), Math.max(...lats)],
          ] as [[number, number], [number, number]])
        : undefined;
    return {
      bounds,
      fitBoundsOptions: { padding: 40, pitch: 60 },
      latitude: mapViewport?.lat ?? 45.5,
      longitude: mapViewport?.lng ?? 6.5,
      zoom: mapViewport?.zoom ?? 12,
      bearing: 0,
      pitch: 60,
    };
  }, [activityList]);

  return (
    <div style={{ height: MAP_HEIGHT, width: "100%" }}>
      <Map
        initialViewState={initialViewState}
        maxPitch={85}
        mapStyle={`https://api.maptiler.com/maps/outdoor-v2/style.json?key=${MAPTILER_KEY}`}
        interactiveLayerIds={activityList.map(
          (a) => `tracks-line-${a.id}-zone`,
        )}
        onClick={(e) => {
          const feature = e.features?.[0];
          if (feature?.layer.id.startsWith("tracks-line-")) {
            const activityId = feature.layer.id.replace("tracks-line-", "");
            if (activityId === selectedActivityId) setSelectedActivityId(null);
            setSelectedActivityId(activityId);
            return;
          }
        }}
        terrain={{ source: "terrain-rgb", exaggeration: 1.5 }}
        onMouseMove={(e) => {
          const point = nearestPoint(
            activityList.flatMap((a) => a.points),
            e.lngLat.lng,
            e.lngLat.lat,
          );
          onHover(
            point,
            point
              ? (activityList.find((a) => a.points.includes(point))?.id ?? null)
              : null,
          );
        }}
        onMouseLeave={() => onHover(null, null)}
      >
        <Map3DContent
          activityList={activityList}
          heatMapField={heatMapField}
          visible={visible}
        />

        {hoveredPoint && (
          <Marker longitude={hoveredPoint.lng} latitude={hoveredPoint.lat}>
            <div className="w-4 h-4 rounded-full bg-white border-2 border-blue-500 shadow" />
          </Marker>
        )}
      </Map>
    </div>
  );
}
