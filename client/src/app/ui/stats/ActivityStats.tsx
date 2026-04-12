"use client";

import { Activity } from "@/lib/schema";
import { useCallback, useState } from "react";
import { MapContainer } from "react-leaflet/MapContainer";
import { TileLayer } from "react-leaflet/TileLayer";
import { CircleMarker, ScaleControl } from "react-leaflet";
import { PointStats } from "@/types/activity";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import MapContent from "./MapContent";
import { useMapStore } from "@/store/mapStore";

type HeatMapField = {
  field: keyof Pick<PointStats, "speed" | "elevation" | "heartrate">;
  unit: string;
};

const HEATMAP_OPTIONS: HeatMapField[] = [
  { field: "speed", unit: "km/h" },
  { field: "elevation", unit: "m" },
  { field: "heartrate", unit: "bpm" },
];

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
          bounds={activityList
            .filter((a) => a.startLat && a.startLng)
            .map((a) => [a.startLat, a.startLng])}
          maxZoom={22}
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
