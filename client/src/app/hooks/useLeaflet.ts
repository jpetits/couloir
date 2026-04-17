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

export function useSyncViewport() {
  const map = useMap();
  const setMapViewport = useMapStore((state) => state.setMapViewport);

  const sync = () => {
    const center = map.getCenter();
    setMapViewport({ lat: center.lat, lng: center.lng, zoom: map.getZoom() });
  };

  useEffect(() => { sync(); }, []);

  useMapEvents({
    moveend: sync,
    zoomend: sync,
  });
}

export function useFitBounds(activityList: Activity[]) {
  const map = useMap();
  const dateSelection = useMapStore((state) => state.dateSelection);
  const yearSelection = useMapStore((state) => state.yearSelection);
  const activityListInBounds = useMapStore((state) => state.activityListInBounds);

  useEffect(() => {
    if (!dateSelection && !yearSelection) return;
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

    const filteredIds = new Set(filtered.map((a) => a.id));
    const points = activityListInBounds
      .filter((a) => filteredIds.has(a.id))
      .flatMap((a) => a.points);

    const lats = points.length
      ? points.map((p) => p.lat)
      : filtered.map((a) => a.startLat as number);
    const lngs = points.length
      ? points.map((p) => p.lng)
      : filtered.map((a) => a.startLng as number);

    map.fitBounds(
      [
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)],
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
  const activityListInBounds = useMapStore((state) => state.activityListInBounds);
  const setActivityListInBounds = useMapStore((state) => state.setActivityListInBounds);
  const profileUsername = useMapStore((state) => state.profileUsername);

  useEffect(() => {
    if (zoom < ZOOM_THRESHOLD) {
      setActivityIdList(activityList.map((a) => a.id));
      return;
    }
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
      zoom,
      profileUsername ?? undefined,
    ).then((activities) => {
      const next = new Map<string, { id: string; points: PointStats[] }>();
      for (const [id, points] of Object.entries(activities)) {
        const activityWithStats = activityList.find((a) => a.id === id);
        if (!activityWithStats) continue;
        const enriched = enrichPointList(points, activityWithStats);
        next.set(id, { id, points: enriched });
      }
      setActivityListInBounds([...next.values()]);
      setActivityIdList(Object.keys(activities));
    });
  }, [zoom, bounds]);

  return { activityListInBounds };
}
