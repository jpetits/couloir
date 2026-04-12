"use client";

import { Activity } from "@/lib/schema";
import { useEffect, useState } from "react";
import { enrichPointList, getClosestPoint } from "@/lib/utils";
import { CircleMarker, Polyline } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { useBounds, useZoom } from "@/app/hooks/useLeaflet";
import { PointStats } from "@/types/activity";
import { fetchActivitiesWithPointsInBounds } from "@/lib/dataClient";
import { useApi } from "@/app/hooks/useApi";
import ActivityPolylines from "./ActivityPolylines";
import { useMapStore } from "@/store/mapStore";

const ZOOM_THRESHOLD = 10;

export default function MapContent({
  activityList,
  handleHover,
  hoveredActivity,
  heatMapField,
}: {
  activityList: Activity[];
  handleHover: (point: PointStats | null, activity?: string | null) => void;
  hoveredActivity: Activity | null;
  heatMapField: { field: keyof PointStats; unit: string };
}) {
  const [activityListInBounds, setActivityListInBounds] = useState<
    { id: string; points: PointStats[] }[]
  >([]);
  const apiFetch = useApi();
  const zoom = useZoom();
  const bounds = useBounds();
  const selection = useMapStore((state) => state.dateSelection);
  const setActivityIdList = useMapStore((state) => state.setActivityIdList);

  useEffect(() => {
    if (zoom < ZOOM_THRESHOLD) {
      setActivityIdList(activityList.map((a) => a.id));
      return;
    }
    if (zoom >= ZOOM_THRESHOLD) {
      fetchActivitiesWithPointsInBounds(
        apiFetch,
        {
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest(),
        },
        activityListInBounds.map((a) => a.id),
        zoom,
      ).then((activities) => {
        setActivityListInBounds((prev) => {
          const prev_map = new Map(prev.map((a) => [a.id, a]));
          const next = new Map<string, { id: string; points: PointStats[] }>();

          for (const [id, points] of Object.entries(activities)) {
            const existing = prev_map.get(id);
            if (!existing || points.length > existing.points.length) {
              const enriched = enrichPointList(
                points,
                activityList.find((a) => a.id === id)!,
              );
              next.set(id, { id, points: enriched });
            } else {
              next.set(id, existing);
            }
          }

          return [...next.values()];
        });
        setActivityIdList(Object.keys(activities));
      });
    }
  }, [zoom, bounds]);

  return (
    <>
      {zoom < ZOOM_THRESHOLD ? (
        <MarkerClusterGroup showCoverageOnHover={false}>
          {activityList
            .filter((a) => {
              if (!selection) return true;
              const activityDate = a.date.split("T")[0];
              return (
                activityDate >= selection.start && activityDate <= selection.end
              );
            })
            .map(
              (a) =>
                a.startLat &&
                a.startLng && (
                  <CircleMarker
                    key={a.id}
                    center={[a.startLat, a.startLng]}
                    radius={6}
                    pathOptions={{
                      color: "#3b82f6",
                      fillColor: "#3b82f6",
                      fillOpacity: 1,
                      weight: 2,
                    }}
                  />
                ),
            )}
        </MarkerClusterGroup>
      ) : (
        activityListInBounds
          .filter(({ id }) => {
            if (!selection) return true;
            const activity = activityList.find((a) => a.id === id);
            if (!activity) return false;
            const activityDate = activity.date.split("T")[0];
            return (
              activityDate >= selection.start && activityDate <= selection.end
            );
          })
          .map(({ id, points }) => (
            <div key={id}>
              <ActivityPolylines
                key={id}
                points={points}
                heatMapField={heatMapField}
                status={
                  hoveredActivity === null
                    ? "idle"
                    : hoveredActivity.id === id
                      ? "hovered"
                      : "dimmed"
                }
              />
              <Polyline
                positions={points}
                color="transparent"
                weight={20}
                eventHandlers={{
                  mousemove: (e) => {
                    handleHover(
                      getClosestPoint(e.latlng.lat, e.latlng.lng, points),
                      id,
                    );
                  },
                }}
              />
            </div>
          ))
      )}
    </>
  );
}
