"use client";

import { Activity } from "@/lib/schema";
import { getClosestPoint } from "@/lib/utils";
import { CircleMarker, Polyline } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import {
  useFetchActivityListInBounds,
  useFitBounds,
  useZoom,
} from "@/app/hooks/useLeaflet";
import { PointStats } from "@/types/activity";
import ActivityPolylines from "./ActivityPolylines";
import { useMapStore } from "@/store/mapStore";
import { ZOOM_THRESHOLD } from "@/lib/constants";

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
  const zoom = useZoom();
  const dateSelection = useMapStore((state) => state.dateSelection);
  const yearSelection = useMapStore((state) => state.yearSelection);

  useFitBounds(activityList);
  const { activityListInBounds } = useFetchActivityListInBounds(activityList);

  const yearSelectionFilter = (activity: Activity) => {
    if (!yearSelection) return true;
    const activityYear = new Date(activity.date).getFullYear();
    return activityYear === yearSelection;
  };

  const dateSelectionFilter = (activity: Activity) => {
    if (!dateSelection) return true;
    const activityDate = activity.date.split("T")[0];
    return (
      activityDate >= dateSelection.start && activityDate <= dateSelection.end
    );
  };

  const filterByYearAndDateSelection = <T extends { id: string }>(
    activityListToFilter: T[],
  ) => {
    return activityListToFilter.filter(({ id }) => {
      const activityWithStats = activityList.find((a) => a.id === id);
      if (!activityWithStats) return false;

      return (
        yearSelectionFilter(activityWithStats) &&
        dateSelectionFilter(activityWithStats)
      );
    });
  };

  const filteredActivityList =
    filterByYearAndDateSelection(activityListInBounds);

  const getStatus = (id: string) => {
    if (!hoveredActivity) return "idle";
    if (hoveredActivity.id === id) return "hovered";
    return "dimmed";
  };

  return (
    <>
      {zoom < ZOOM_THRESHOLD ? (
        <MarkerClusterGroup showCoverageOnHover={false}>
          {filterByYearAndDateSelection(activityList).map((activity) => (
            <CircleMarker
              key={activity.id}
              center={[activity.startLat!, activity.startLng!]}
              radius={6}
              pathOptions={{
                color: "#3b82f6",
                fillColor: "#3b82f6",
                fillOpacity: 1,
                weight: 2,
              }}
            />
          ))}
        </MarkerClusterGroup>
      ) : (
        filteredActivityList.map(({ id, points }) => (
          <div key={id}>
            <ActivityPolylines
              key={id}
              points={points}
              heatMapField={heatMapField}
              status={getStatus(id)}
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
