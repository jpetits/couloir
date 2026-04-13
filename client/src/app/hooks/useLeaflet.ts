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

export function useBounds() {
  const map = useMap();
  const [bounds, setBounds] = useState(map.getBounds());

  useMapEvents({
    zoomend: () => setBounds(map.getBounds()),
    moveend: () => setBounds(map.getBounds()),
  });

  return bounds;
}
