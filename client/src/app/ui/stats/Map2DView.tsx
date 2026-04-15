"use client";

import { CircleMarker, useMapEvents } from "react-leaflet";

import L from "leaflet";
import { useShallow } from "zustand/react/shallow";

import { useFitBounds, useSyncViewport } from "@/app/hooks/useLeaflet";
import { ZOOM_THRESHOLD } from "@/lib/constants";
import { Activity } from "@/lib/schema";
import { useMapStore } from "@/store/mapStore";
import { PointStats } from "@/types/activity";

import Map2DContent from "./Map2DContent";

export default function Map2DView({
  activityList,
  handleHover,
  hoveredActivity,
  showPhotos,
}: {
  activityList: Activity[];
  handleHover: (point: PointStats | null, activity?: string | null) => void;
  hoveredActivity: Activity | null;
  showPhotos: boolean;
}) {
  const {
    hoveredPoint,
    hoveredActivityPoints,
    selectedActivityId,
    setHoveredPoint,
    setHoveredActivityPoints,
    setSelectedActivityId,
  } = useMapStore(
    useShallow((state) => ({
      hoveredPoint: state.hoveredPoint,
      hoveredActivityPoints: state.hoveredActivityPoints,
      selectedActivityId: state.selectedActivityId,
      setHoveredPoint: state.setHoveredPoint,
      setHoveredActivityPoints: state.setHoveredActivityPoints,
      setSelectedActivityId: state.setSelectedActivityId,
    })),
  );

  useFitBounds(activityList);
  useSyncViewport();

  useMapEvents({
    click: () => setSelectedActivityId(null),
    zoomend: (e) => {
      if (e.target.getZoom() < ZOOM_THRESHOLD && selectedActivityId) {
        setSelectedActivityId(null);
        setHoveredActivityPoints([]);
        setHoveredPoint(null);
      }
    },
  });

  return (
    <>
      <Map2DContent
        activityList={activityList}
        handleHover={handleHover}
        hoveredActivity={hoveredActivity}
        showPhotos={showPhotos}
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
          eventHandlers={{
            click: (e) => {
              L.DomEvent.stopPropagation(e);
              const id = hoveredActivityPoints[0]?.activityId ?? null;
              if (selectedActivityId === id) {
                setSelectedActivityId(null);
              } else {
                setSelectedActivityId(id);
              }
            },
          }}
        />
      )}
    </>
  );
}
