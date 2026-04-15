"use client";

import { useEffect, useMemo } from "react";
import Map, { Layer, Marker, Source, useMap } from "react-map-gl/maplibre";

import "maplibre-gl/dist/maplibre-gl.css";

import { toSegmentGeojson } from "@/lib/utils";
import type { ActivityWithPoints } from "@/store/mapStore";
import { useMapStore } from "@/store/mapStore";
import type { PointStats } from "@/types/activity";

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;

function SyncViewport({ visible }: { visible: boolean }) {
  const { current: map } = useMap();
  const mapViewport = useMapStore((s) => s.mapViewport);

  useEffect(() => {
    if (!visible || !map || !mapViewport) return;
    map.flyTo({
      center: [mapViewport.lng, mapViewport.lat],
      zoom: mapViewport.zoom,
      pitch: 60,
      duration: 600,
    });
  }, [visible]);

  return null;
}

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
  const mapViewport = useMapStore((s) => s.mapViewport);
  const setSelectedActivityId = useMapStore((s) => s.setSelectedActivityId);
  const selectedActivityId = useMapStore((s) => s.selectedActivityId);
  const heatMapField = useMapStore((s) => s.heatMapField);

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
    <div className="w-full h-150">
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
            console.log("clicked feature", feature);
            const activityId = feature.layer.id.replace("tracks-line-", "");
            console.log("clicked activityId", activityId);
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
        {!activityList && <SyncViewport visible={visible} />}
        <Source
          id="terrain-rgb"
          type="raster-dem"
          url={`https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json?key=${MAPTILER_KEY}`}
          tileSize={256}
        />
        <Layer
          id="hillshade"
          type="hillshade"
          source="terrain-rgb"
          paint={{
            "hillshade-exaggeration": 0.3,
            "hillshade-shadow-color": "#000000",
            "hillshade-highlight-color": "#ffffff",
          }}
        />
        {activityList.map((activity) => (
          <span key={activity.id}>
            <Source
              key={activity.id + "-zone"}
              id={`tracks-${activity.id}-zone`}
              type="geojson"
              data={{
                type: "FeatureCollection",
                features: activity.points.map((p) => ({
                  type: "Feature" as const,
                  properties: {},
                  geometry: {
                    type: "Point" as const,
                    coordinates: [p.lng, p.lat],
                  },
                })),
              }}
            >
              <Layer
                key={`tracks-line-${activity.id}-zone`}
                id={`tracks-line-${activity.id}-zone`}
                type="line"
                paint={{
                  "line-width": 10,
                  "line-opacity": 1,
                }}
              />
            </Source>
            <Source
              key={activity.id}
              id={`tracks-${activity.id}`}
              type="geojson"
              data={toSegmentGeojson(activity.points, heatMapField)}
            >
              <Layer
                key={`tracks-line-${activity.id}`}
                id={`tracks-line-${activity.id}`}
                type="line"
                paint={{
                  "line-color": ["get", "color"],
                  "line-width": 5,
                  "line-dasharray": [1, 1],
                  "line-opacity": 0.8,
                }}
              />
            </Source>
          </span>
        ))}
        {hoveredPoint && (
          <Marker longitude={hoveredPoint.lng} latitude={hoveredPoint.lat}>
            <div className="w-4 h-4 rounded-full bg-white border-2 border-blue-500 shadow" />
          </Marker>
        )}
      </Map>
    </div>
  );
}
