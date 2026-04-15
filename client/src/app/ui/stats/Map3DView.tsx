"use client";

import { useEffect } from "react";
import Map, { Layer, Source, useMap } from "react-map-gl/maplibre";

import "maplibre-gl/dist/maplibre-gl.css";

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

function toGeojson(list: ActivityWithPoints[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: list.map(({ id, points }) => ({
      type: "Feature",
      properties: { id },
      geometry: {
        type: "LineString",
        coordinates: points.map((p) => [p.lng, p.lat, p.elevation]),
      },
    })),
  };
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
  activityList,
}: {
  visible?: boolean;
  activityList?: ActivityWithPoints[];
  height?: string;
}) {
  const storeList = useMapStore((s) => s.activityListInBounds);
  const mapViewport = useMapStore((s) => s.mapViewport);

  const list = activityList ?? storeList;
  const geojson = toGeojson(list);

  const allPoints = list.flatMap((a) => a.points);
  const center = centerOfPoints(allPoints);

  const initialViewState = {
    latitude: center?.lat ?? mapViewport?.lat ?? 45.5,
    longitude: center?.lng ?? mapViewport?.lng ?? 6.5,
    zoom: activityList ? 13 : (mapViewport?.zoom ?? 12),
    bearing: 0,
    pitch: 60,
  };

  return (
    <div className="w-full h-150">
      <Map
        initialViewState={initialViewState}
        maxPitch={85}
        mapStyle={`https://api.maptiler.com/maps/outdoor-v2/style.json?key=${MAPTILER_KEY}`}
        terrain={{ source: "terrain-rgb", exaggeration: 1.5 }}
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
        <Source id="tracks" type="geojson" data={geojson}>
          <Layer
            id="tracks-line"
            type="line"
            paint={{
              "line-color": "#3b82f6",
              "line-width": 2,
              "line-opacity": 0.8,
            }}
          />
        </Source>
      </Map>
    </div>
  );
}
