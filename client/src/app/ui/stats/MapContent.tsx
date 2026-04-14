"use client";

import { CircleMarker, Marker, Polyline, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";

import { format } from "date-fns";
import L from "leaflet";

import {
  useFetchActivityListInBounds,
  useFitBounds,
  useZoom,
} from "@/app/hooks/useLeaflet";
import { DATE_FORMAT, ZOOM_THRESHOLD } from "@/lib/constants";
import { Activity } from "@/lib/schema";
import { getClosestPoint } from "@/lib/utils";
import { ROUTES } from "@/routing/constants";
import { useMapStore } from "@/store/mapStore";
import { PointStats } from "@/types/activity";

import ActivityPolylines from "./ActivityPolylines";

export default function MapContent({
  activityList,
  handleHover,
  hoveredActivity,
  heatMapField,
  showPhotos,
}: {
  activityList: Activity[];
  handleHover: (point: PointStats | null, activity?: string | null) => void;
  hoveredActivity: Activity | null;
  heatMapField: { field: keyof PointStats; unit: string };
  showPhotos: boolean;
}) {
  const zoom = useZoom();

  const dateSelection = useMapStore((state) => state.dateSelection);
  const yearSelection = useMapStore((state) => state.yearSelection);

  useFitBounds(activityList);
  const { activityListInBounds } = useFetchActivityListInBounds(activityList);

  const yearSelectionFilter = (activity: Activity) => {
    if (!yearSelection) return true;
    const activityYear = activity.startDate.getFullYear();
    return activityYear === yearSelection;
  };

  const dateSelectionFilter = (activity: Activity) => {
    if (!dateSelection) return true;
    const activityDate = format(activity.startDate, DATE_FORMAT);
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

  const allImages = activityList.flatMap((a) =>
    (a.images ?? []).filter((img) => img.lat && img.lng),
  );

  const makePhotoIcon = (immichId: string) =>
    L.divIcon({
      html: `<div style="width:48px;height:48px;border:2px solid white;border-radius:4px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.4)">
        <img src="${ROUTES.api.imagePath(immichId, "thumbnail")}" style="width:100%;height:100%;object-fit:cover" />
      </div>`,
      className: "",
      iconSize: [48, 48],
      iconAnchor: [24, 24],
    });

  return (
    <>
      {showPhotos &&
        zoom >= ZOOM_THRESHOLD &&
        allImages.map((img) => (
          <Marker
            key={img.id}
            position={[img.lat!, img.lng!]}
            icon={makePhotoIcon(img.immichId)}
          >
            <Popup minWidth={300} maxWidth={300}>
              <img
                src={ROUTES.api.imagePath(img.immichId, "thumbnail")}
                alt=""
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </Popup>
          </Marker>
        ))}
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
