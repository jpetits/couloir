import { useEffect, useState } from "react";
import { useMap, useMapEvents } from "react-leaflet";

import { format } from "date-fns";

import { DATE_FORMAT, ZOOM_THRESHOLD } from "@/lib/constants";
import { fetchActivitiesWithPointsInBounds } from "@/lib/dataClient";
import { Activity } from "@/lib/schema";
import { enrichPointList } from "@/lib/utils";
import { useMapStore } from "@/store/mapStore";
import { PointStats } from "@/types/activity";

import { useApi } from "./useApi";

export function useZoom() {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());

  useMapEvents({
    zoomend: () => setZoom(map.getZoom()),
  });

  return zoom;
}

export function useBounds() {
  const map = useMap();
  const [bounds, setBounds] = useState(map.getBounds());

  useMapEvents({
    zoomend: () => setBounds(map.getBounds()),
    moveend: () => setBounds(map.getBounds()),
  });

  return bounds;
}

export function useFitBounds(activityList: Activity[]) {
  const map = useMap();
  const zoom = useZoom();
  const dateSelection = useMapStore((state) => state.dateSelection);
  const yearSelection = useMapStore((state) => state.yearSelection);

  useEffect(() => {
    if ((!dateSelection && !yearSelection) || zoom >= ZOOM_THRESHOLD) return;
    const filtered = activityList.filter((activity) => {
      const date = format(activity.startDate, DATE_FORMAT);
      const hasActivityStartPoint =
        activity.startLat !== undefined && activity.startLng !== undefined;
      const isActivityDateInRange = dateSelection
        ? date >= dateSelection.start && date <= dateSelection.end
        : true;
      const filterDateSelection =
        hasActivityStartPoint && isActivityDateInRange;
      const filterYearSelection = yearSelection
        ? activity.startDate.getFullYear() === yearSelection
        : true;
      return filterDateSelection && filterYearSelection;
    });
    if (filtered.length === 0) return;
    const activityListLats = filtered.map(
      (activity) => activity.startLat as number,
    );
    const activityListLngs = filtered.map(
      (activity) => activity.startLng as number,
    );
    map.fitBounds(
      [
        [Math.min(...activityListLats), Math.min(...activityListLngs)],
        [Math.max(...activityListLats), Math.max(...activityListLngs)],
      ],
      { padding: [100, 100], animate: true, duration: 0.5 },
    );
  }, [dateSelection, yearSelection]);
}

export function useFetchActivityListInBounds(activityList: Activity[]) {
  const apiFetch = useApi();
  const bounds = useBounds();
  const zoom = useZoom();

  const setActivityIdList = useMapStore((state) => state.setActivityIdList);

  const [activityListInBounds, setActivityListInBounds] = useState<
    { id: string; points: PointStats[] }[]
  >([]);

  useEffect(() => {
    if (zoom < ZOOM_THRESHOLD) {
      // under zoom threshold, we do not fetch points, we just set the activity list in bounds to the activities in bounds
      setActivityIdList(activityList.map((a) => a.id));
      return;
    }
    if (zoom >= ZOOM_THRESHOLD) {
      const mapBounds = {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      };
      fetchActivitiesWithPointsInBounds(
        apiFetch,
        mapBounds,
        activityListInBounds.map((a) => a.id),
        zoom, // adjust points detail based on zoom level
      ).then((activities) => {
        setActivityListInBounds(() => {
          const next = new Map<string, { id: string; points: PointStats[] }>();

          for (const [id, points] of Object.entries(activities)) {
            const activityWithStats = activityList.find((a) => a.id === id);
            if (!activityWithStats) continue;
            const enriched = enrichPointList(points, activityWithStats);
            next.set(id, { id, points: enriched });
          }

          return [...next.values()];
        });
        setActivityIdList(Object.keys(activities));
      });
    }
  }, [zoom, bounds]);

  return { activityListInBounds };
}
