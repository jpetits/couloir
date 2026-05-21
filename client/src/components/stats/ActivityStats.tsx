"use client";

import { useCallback, useEffect, useState } from "react";
import { Marker, ScaleControl } from "react-leaflet";
import { MapContainer } from "react-leaflet/MapContainer";
import { TileLayer } from "react-leaflet/TileLayer";

import { format } from "date-fns";
import { X } from "lucide-react";
import { useTheme } from "next-themes";
import { useDebounce } from "use-debounce";
import { useShallow } from "zustand/react/shallow";

import { useApi } from "@/app/hooks/useApi";
import { DATE_FORMAT, MAP_MAX_ZOOM, MAP_WIDTH } from "@/lib/constants";
import { searchActivities } from "@/lib/dataClient";
import {
  startLeafletIcon,
  stopLeafletIcon,
  summitLeafletIcon,
} from "@/lib/leafletIcons";
import { Activity } from "@/lib/schema";
import { useMapStore } from "@/store/mapStore";
import { PointStats } from "@/types/activity";

import Map2DView from "../map/Map2DView";
import Map3DView from "../map/Map3DView";
import MapSidePanel from "../map/MapSidePanel";

export default function memoActivityStats({
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
    activityListInBounds,
    hoveredActivity,
    setHoveredActivity,
    selectedActivityId,
  } = useMapStore(
    useShallow((state) => ({
      setHoveredDate: state.setHoveredDate,
      setHoveredPoint: state.setHoveredPoint,
      setHoveredActivityPoints: state.setHoveredActivityPoints,
      heatMapField: state.heatMapField,
      setHeatMapField: state.setHeatMapField,
      selectedActivityId: state.selectedActivityId,
      activityListInBounds: state.activityListInBounds,
      hoveredActivity: state.hoveredActivity,
      setHoveredActivity: state.setHoveredActivity,
    })),
  );

  const [searchIdList, setSearchIdList] = useState<string[] | null>(null);
  const panelActivity = selectedActivityId
    ? activityList.find((a) => a.id === selectedActivityId)
    : null;
  const [drawerActivity, setDrawerActivity] = useState<Activity | null>(null);
  useEffect(() => {
    if (panelActivity) setDrawerActivity(panelActivity);
  }, [panelActivity?.id]);

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

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  const apiFetch = useApi();

  useEffect(() => {
    if (debouncedSearchTerm === "") {
      setSearchIdList(null);
      return;
    }
    searchActivities(apiFetch, debouncedSearchTerm).then((results) => {
      if (results.length > 0) {
        console.log(
          "search",
          results.map((r) => r.id),
        );
        setSearchIdList(results.map((r) => r.id));
      } else {
        setSearchIdList(null);
      }
    });
  }, [debouncedSearchTerm]);

  return (
    <div className="flex flex-col gap-1">
      <div
        className="relative overflow-hidden"
        onMouseLeave={() => {
          handleHover(null, null);
          setHoveredDate(null);
          setHoveredActivity(null);
          if (!selectedActivityId) setHoveredActivityPoints([]);
        }}
      >
        <div className="absolute top-2.5 left-15 z-1000 flex gap-2 items-center flex-wrap font-condensed">
          <button
            onClick={() => setShowPhotos((v) => !v)}
            className={`px-3 py-1 border font-mono text-3xs tracking-widest uppercase transition-all duration-150 shadow-sm ${
              showPhotos
                ? "border-ui-muted text-ui-hi bg-ui-fill"
                : "border-ui-line text-ui-muted bg-ui-surface hover:border-ui-dim hover:text-ui-base"
            }`}
          >
            Photos
          </button>
          <button
            onClick={() => setShow3DView((v) => !v)}
            className={`px-3 py-1 border font-mono text-3xs tracking-widest uppercase transition-all duration-150 shadow-sm ${
              show3DView
                ? "border-ui-muted text-ui-hi bg-ui-fill"
                : "border-ui-line text-ui-muted bg-ui-surface hover:border-ui-dim hover:text-ui-base"
            }`}
          >
            3D
          </button>
          <div className="relative">
            <span className="font-mono absolute left-2.5 top-1/2 -translate-y-1/2 text-ui-dim pointer-events-none text-3xs">
              /
            </span>
            <input
              type="text"
              placeholder="search…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="font-condensed h-7 pl-6 pr-7 bg-ui-surface border border-ui-line hover:border-ui-dim focus:border-ui-muted text-ui-hi placeholder-ui-ghost focus:outline-none text-sm tracking-wide shadow-sm transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-ui-muted hover:text-ui-base leading-none"
              >
                <X size={10} />
              </button>
            )}
          </div>
        </div>

        <div className={show3DView ? "hidden" : ""}>
          <>
            <MapContainer
              className="markercluster-map  md:h-[calc(100dvh-4rem)] h-dvh"
              bounds={
                activityList.map((a) => [a.startLat, a.startLng]) as [
                  number,
                  number,
                ][]
              }
              maxZoom={MAP_MAX_ZOOM}
              style={{
                width: MAP_WIDTH,
              }}
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
                activityList={activityList.filter((a) =>
                  searchIdList ? searchIdList.includes(a.id) : true,
                )}
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
        {show3DView && (
          <Map3DView
            visible={show3DView}
            activityList={activityListInBounds}
            onHover={handleHover}
          />
        )}
        {(panelActivity ?? drawerActivity) && (
          <MapSidePanel
            activity={(panelActivity ?? drawerActivity)!}
            open={!!panelActivity}
          />
        )}
      </div>
    </div>
  );
}
