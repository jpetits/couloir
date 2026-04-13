"use client";

import { Activity } from "@/lib/schema";
import { useCallback, useState } from "react";
import { MapContainer } from "react-leaflet/MapContainer";
import { TileLayer } from "react-leaflet/TileLayer";
import { CircleMarker, Marker, ScaleControl } from "react-leaflet";
import { PointStats } from "@/types/activity";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import MapContent from "./MapContent";
import { useMapStore } from "@/store/mapStore";
import L from "leaflet";

type HeatMapField = {
  field: keyof Pick<PointStats, "speed" | "elevation" | "heartrate">;
  unit: string;
};

const HEATMAP_OPTIONS: HeatMapField[] = [
  { field: "speed", unit: "km/h" },
  { field: "elevation", unit: "m" },
  { field: "heartrate", unit: "bpm" },
];

const startLeafletIcon = L.divIcon({
  html: `<svg width="24" height="24" viewBox="0 0 24 24" 
  xmlns="http://www.w3.org/2000/svg">                    
    <circle cx="12" cy="12" r="12" fill="#3b82f6"/>      
    <polygon points="8.5,7 18.5,12 8.5,17" fill="white"/>    
  </svg>`,
  className: "",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const stopLeafletIcon = L.divIcon({
  html: `<svg width="24" height="24" viewBox="0 0 24 24" 
  xmlns="http://www.w3.org/2000/svg">                    
    <circle cx="12" cy="12" r="12" fill="red"/>      
    <rect x="8" y="8" width="8" height="8" fill="white"/>    
  </svg>`,
  className: "",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

export default function ActivityStats({
  activityList,
}: {
  activityList: Activity[];
}) {
  const [heatMapField, setHeatMapField] = useState<{
    field: keyof PointStats;
    unit: string;
  }>({ field: "speed", unit: "km/h" });
  const [hoveredPoint, setHoveredPoint] = useState<PointStats | null>(null);
  const [hoveredActivity, setHoveredActivity] = useState<Activity | null>(null);
  const setHoveredDate = useMapStore((state) => state.setHoveredDate);
  const handleHover = useCallback(
    (point: PointStats | null, activityId?: string | null) => {
      setHoveredPoint(point);

      if (activityId) {
        const activity = activityList.find((a) => a.id === activityId) || null;
        setHoveredDate(activity?.date || null);
        setHoveredActivity(activity);
      }
    },
    [activityList],
  );

  const activityListBounds = activityList
    .filter((a) => a.startLat && a.startLng)
    .map((a) => [a.startLat, a.startLng]) as [number, number][];

  return (
    <div className="flex flex-col gap-1 mt-3">
      <div className="flex gap-2">
        {HEATMAP_OPTIONS.map(({ field, unit }) => (
          <Button
            key={field}
            variant={heatMapField.field === field ? "default" : "outline"}
            className="cursor-pointer"
            size="sm"
            onClick={() => setHeatMapField({ field, unit })}
          >
            {field.charAt(0).toUpperCase() + field.slice(1)}
          </Button>
        ))}
      </div>

      <div
        className="relative"
        onMouseLeave={() => {
          handleHover(null, null);
          setHoveredDate(null);
          setHoveredActivity(null);
        }}
      >
        {hoveredActivity && (
          <div className="absolute bottom-8 left-2 z-1000 pointer-events-none">
            <Card className="p-3 shadow-lg text-sm min-w-48">
              <p className="font-semibold">{hoveredActivity.name}</p>
              <p className="text-muted-foreground text-xs mt-1">
                {hoveredActivity.date} ·{" "}
                {(hoveredActivity.distance / 1000).toFixed(1)} km ·{" "}
                {hoveredActivity.elevationGain} m d+
              </p>
            </Card>
          </div>
        )}
        <MapContainer
          className="markercluster-map"
          bounds={activityListBounds}
          maxZoom={18}
          style={{ height: "700px", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />

          <MapContent
            activityList={activityList}
            handleHover={handleHover}
            hoveredActivity={hoveredActivity}
            heatMapField={heatMapField}
          />

          {hoveredActivity && (
            <>
              <Marker
                key={hoveredActivity.id + "-end"}
                position={[hoveredActivity.endLat, hoveredActivity.endLng]}
                icon={stopLeafletIcon}
              />
              <Marker
                key={hoveredActivity.id + "-start"}
                position={[hoveredActivity.startLat, hoveredActivity.startLng]}
                icon={startLeafletIcon}
              />
            </>
          )}

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

          <ScaleControl position="bottomleft" imperial={false} />
        </MapContainer>
      </div>
    </div>
  );
}
