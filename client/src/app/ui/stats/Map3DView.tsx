"use client";

import { useEffect } from "react";
import Map, { Layer, Marker, Source, useMap } from "react-map-gl/maplibre";

import "maplibre-gl/dist/maplibre-gl.css";

import { getSegmentsFromPoints, toSegmentGeojson } from "@/lib/utils";
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

function centerOfPoints(points: PointStats[]) {
  if (points.length === 0) return null;
  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  return {
    lat: (Math.min(...lats) + Math.max(...lats)) / 2,
    lng: (Math.min(...lngs) + Math.max(...lngs)) / 2,
  };
}

export default function Map3DView({
  visible = true,
  activity,
  hoveredPoint,
}: {
  visible?: boolean;
  activity: ActivityWithPoints;
  height?: string;
  hoveredPoint?: PointStats | null;
}) {
  const mapViewport = useMapStore((s) => s.mapViewport);

  const center = centerOfPoints(activity?.points ?? []);

  const initialViewState = {
    latitude: center?.lat ?? mapViewport?.lat ?? 45.5,
    longitude: center?.lng ?? mapViewport?.lng ?? 6.5,
    zoom: activity ? 13 : (mapViewport?.zoom ?? 12),
    bearing: 0,
    pitch: 60,
  };
  const segments = getSegmentsFromPoints(activity.points);

  return (
    <div className="w-full h-150">
      <Map
        initialViewState={initialViewState}
        maxPitch={85}
        mapStyle={`https://api.maptiler.com/maps/outdoor-v2/style.json?key=${MAPTILER_KEY}`}
        terrain={{ source: "terrain-rgb", exaggeration: 1.5 }}
      >
        {!activity && <SyncViewport visible={visible} />}
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
        <Source
          key={activity.id}
          id={`tracks-${activity.id}`}
          type="geojson"
          data={toSegmentGeojson(activity.points, {
            field: "elevation",
            unit: "m",
          })}
        >
          <Layer
            key={`tracks-line-${activity.id}`}
            id={`tracks-line-${activity.id}`}
            type="line"
            paint={{
              "line-color": ["get", "color"],
              "line-width": 5,
              "line-opacity": 0.8,
            }}
          />
        </Source>
        {hoveredPoint && (
          <Marker longitude={hoveredPoint.lng} latitude={hoveredPoint.lat}>
            <div className="w-4 h-4 rounded-full bg-white border-2 border-blue-500 shadow" />
          </Marker>
        )}
      </Map>
    </div>
  );
}
