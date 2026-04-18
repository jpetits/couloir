import { memo, useEffect } from "react";
import { Layer, Source, useMap } from "react-map-gl/maplibre";

import { toSegmentGeojson } from "@/lib/utils";
import { useMapStore, type ActivityWithPoints } from "@/store/mapStore";

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

export default memo(function Map3DContent({
  activityList,
  visible,
}: {
  activityList: ActivityWithPoints[];
  visible: boolean;
}) {
  const heatMapField = useMapStore((s) => s.heatMapField);

  return (
    <>
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
    </>
  );
});
