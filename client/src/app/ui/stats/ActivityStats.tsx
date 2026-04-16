"use client";

import { useCallback, useState } from "react";
import { Marker, ScaleControl } from "react-leaflet";
import { MapContainer } from "react-leaflet/MapContainer";
import { TileLayer } from "react-leaflet/TileLayer";

import { format } from "date-fns";
import L from "leaflet";
import { useTheme } from "next-themes";
import { useShallow } from "zustand/react/shallow";

import { Button } from "@/components/ui/button";
import { DATE_FORMAT, HEATMAP_OPTIONS, MAP_HEIGHT } from "@/lib/constants";
import { Activity } from "@/lib/schema";
import { useMapStore } from "@/store/mapStore";
import { PointStats } from "@/types/activity";

import Map2DView from "./Map2DView";
import Map3DView from "./Map3DView";
import MapSidePanel from "./MapSidePanel";

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

const summitLeafletIcon = L.divIcon({
  html: `<svg width="24" height="24" viewBox="0 0 24 24" 
  xmlns="http://www.w3.org/2000/svg">                    
    <circle cx="12" cy="12" r="12" fill="#fbbf24"/>      
    <polygon points="12,6 16,14 8,14" fill="white"/>    
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
  const [showPhotos, setShowPhotos] = useState(false);
  const [show3DView, setShow3DView] = useState(false);
  const {
    setHoveredDate,
    setHoveredPoint,
    setHoveredActivityPoints,
    heatMapField,
    setHeatMapField,
    hoveredPoint,
    activityListInBounds,
    hoveredActivity,
    setHoveredActivity,
  } = useMapStore(
    useShallow((state) => ({
      setHoveredDate: state.setHoveredDate,
      setHoveredPoint: state.setHoveredPoint,
      setHoveredActivityPoints: state.setHoveredActivityPoints,
      hoveredPoint: state.hoveredPoint,
      heatMapField: state.heatMapField,
      setHeatMapField: state.setHeatMapField,
      selectedActivityId: state.selectedActivityId,
      activityListInBounds: state.activityListInBounds,
      hoveredActivity: state.hoveredActivity,
      setHoveredActivity: state.setHoveredActivity,
    })),
  );
  const handleHover = useCallback(
    (point: PointStats | null, activityId?: string | null) => {
      setHoveredPoint(point);

      if (activityId) {
        const activity = activityList.find((a) => a.id === activityId) || null;
        setHoveredDate(
          activity ? format(activity.startDate, DATE_FORMAT) : null,
        );
        setHoveredActivity(activity);
        const activityWithPoints = activityListInBounds.find(
          (a) => a.id === activityId,
        );
        if (activityWithPoints)
          setHoveredActivityPoints(activityWithPoints.points);
      } else {
        setHoveredActivityPoints([]);
      }
    },
    [activityList, activityListInBounds],
  );

  const activityListBounds = activityList.map((a) => [
    a.startLat,
    a.startLng,
  ]) as [number, number][];

  return (
    <div className="flex flex-col gap-1">
      <div
        className="relative overflow-hidden"
        onMouseLeave={() => {
          handleHover(null, null);
          setHoveredDate(null);
          setHoveredActivity(null);
        }}
      >
        <div className="absolute top-2.5 left-15 z-1000 flex gap-1 flex-wrap">
          {HEATMAP_OPTIONS.map(({ field, unit }) => (
            <Button
              key={field}
              variant={heatMapField.field === field ? "default" : "outline"}
              className="cursor-pointer shadow"
              size="sm"
              onClick={() => setHeatMapField(field, unit)}
            >
              {field.charAt(0).toUpperCase() + field.slice(1)}
            </Button>
          ))}
          <Button
            variant={showPhotos ? "default" : "outline"}
            className="cursor-pointer shadow"
            size="sm"
            onClick={() => setShowPhotos((v) => !v)}
          >
            Photos
          </Button>
          <Button
            variant={show3DView ? "default" : "outline"}
            className="cursor-pointer shadow"
            size="sm"
            onClick={() => setShow3DView((v) => !v)}
          >
            3D View
          </Button>
        </div>

        <div className={show3DView ? "hidden" : ""}>
          <>
            <MapContainer
              className="markercluster-map"
              bounds={activityListBounds}
              maxZoom={18}
              style={{ height: MAP_HEIGHT, width: "100%" }}
            >
              <TileLayer
                url={
                  resolvedTheme === "dark"
                    ? "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key=${process.env.NEXT_PUBLIC_STADIA_API_KEY}"
                    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                }
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
              />

              <Map2DView
                activityList={activityList}
                handleHover={handleHover}
                hoveredActivity={hoveredActivity}
                showPhotos={showPhotos}
              />

              {hoveredActivity && (
                <>
                  <Marker
                    key={hoveredActivity.id + "-end"}
                    position={[
                      hoveredActivity.endLat!,
                      hoveredActivity.endLng!,
                    ]}
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
                  {hoveredActivity.activitySummits
                    ?.map((as) => as.summit)
                    .map((summit) => (
                      <Marker
                        key={hoveredActivity.id + "-summit-" + summit.id}
                        position={[summit.lat, summit.lng]}
                        icon={summitLeafletIcon}
                      />
                    ))}
                </>
              )}

              <ScaleControl position="bottomleft" imperial={false} />
            </MapContainer>
          </>
        </div>
        {hoveredActivity && (
          <MapSidePanel
            activity={activityList.find((a) => a.id === hoveredActivity?.id)!}
          />
        )}
        {show3DView && (
          <Map3DView
            visible={show3DView}
            hoveredPoint={hoveredPoint}
            activityList={activityListInBounds}
            onHover={handleHover}
          />
        )}
      </div>
    </div>
  );
}
