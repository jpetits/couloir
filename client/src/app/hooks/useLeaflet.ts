import { useEffect, useState } from "react";

import { useMap, useMapEvents } from "react-leaflet";

export function useZoom() {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());

  useMapEvents({
    zoomend: () => setZoom(map.getZoom()),
  });

  return zoom;
}

export const useFitBounds = (points: { lat: number; lng: number }[]) => {
  const map = useMap();
  useEffect(() => {
    if (points.length > 0) {
      const bounds = points.map((p) => [p.lat, p.lng] as [number, number]);
      map.fitBounds(bounds);
    }
  }, []);
  return null;
};

export function useBounds() {
  const map = useMap();
  const [bounds, setBounds] = useState(map.getBounds());

  useMapEvents({
    zoomend: () => setBounds(map.getBounds()),
    moveend: () => setBounds(map.getBounds()),
  });

  return bounds;
}
