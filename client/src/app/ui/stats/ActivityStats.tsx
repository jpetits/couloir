"use client";

import { useCallback, useState } from "react";
import { Marker, ScaleControl } from "react-leaflet";
import { MapContainer } from "react-leaflet/MapContainer";
import { TileLayer } from "react-leaflet/TileLayer";

import { format } from "date-fns";
import L from "leaflet";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { DATE_FORMAT, HEATMAP_OPTIONS } from "@/lib/constants";
import { Activity } from "@/lib/schema";
import { useMapStore } from "@/store/mapStore";
import { PointStats } from "@/types/activity";

import ActivitySidePanel from "./ActivitySidePanel";
import MapContent from "./MapContent";

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
  const { resolvedTheme } = useTheme();
  const [heatMapField, setHeatMapField] = useState<{
    field: keyof PointStats;
    unit: string;
  }>({ field: "speed", unit: "km/h" });
  const [hoveredActivity, setHoveredActivity] = useState<Activity | null>(null);
  const [showPhotos, setShowPhotos] = useState(false);
  const [show3DView, setShow3DView] = useState(false);
  const setHoveredDate = useMapStore((state) => state.setHoveredDate);
  const setHoveredPoint = useMapStore((state) => state.setHoveredPoint);
  const handleHover = useCallback(
    (point: PointStats | null, activityId?: string | null) => {
      setHoveredPoint(point);

      if (activityId) {
        const activity = activityList.find((a) => a.id === activityId) || null;
        setHoveredDate(
          activity ? format(activity.startDate, DATE_FORMAT) : null,
        );
        setHoveredActivity(activity);
      }
    },
    [activityList],
  );

  const activityListBounds = activityList.map((a) => [
    a.startLat,
    a.startLng,
  ]) as [number, number][];

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
        <div className="ml-auto">
          <Button
            variant={showPhotos ? "default" : "outline"}
            className="cursor-pointer ml-auto"
            size="sm"
            onClick={() => setShowPhotos((v) => !v)}
          >
            Photos
          </Button>
          <Button
            variant={show3DView ? "default" : "outline"}
            className="cursor-pointer ml-auto"
            size="sm"
            onClick={() => setShow3DView((v) => !v)}
          >
            3D View
          </Button>
        </div>
      </div>

      <div
        className="relative overflow-hidden"
        onMouseLeave={() => {
          handleHover(null, null);
          setHoveredDate(null);
          setHoveredActivity(null);
        }}
      >
        <MapContainer
          className="markercluster-map"
          bounds={activityListBounds}
          maxZoom={18}
          style={{ height: "700px", width: "100%" }}
        >
          <TileLayer
            url={
              resolvedTheme === "dark"
                ? "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
                : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            }
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          />

          <MapContent
            activityList={activityList}
            handleHover={handleHover}
            hoveredActivity={hoveredActivity}
            showPhotos={showPhotos}
            heatMapField={heatMapField}
          />

          {hoveredActivity && (
            <>
              <Marker
                key={hoveredActivity.id + "-end"}
                position={[hoveredActivity.endLat!, hoveredActivity.endLng!]}
                icon={stopLeafletIcon}
              />
              <Marker
                key={hoveredActivity.id + "-start"}
                position={[
                  hoveredActivity.startLat!,
                  hoveredActivity.startLng!,
                ]}
                icon={startLeafletIcon}
              />
            </>
          )}

          <ScaleControl position="bottomleft" imperial={false} />
        </MapContainer>
        {hoveredActivity && (
          <ActivitySidePanel
            activity={activityList.find((a) => a.id === hoveredActivity?.id)!}
          />
        )}
      </div>
    </div>
  );
}
