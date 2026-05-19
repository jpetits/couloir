"use client";

import { memo } from "react";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { format } from "date-fns";
import { X } from "lucide-react";
import Link from "next/link";
import { useShallow } from "zustand/react/shallow";

import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import {
  useIsLandscape,
  useIsMobile,
  useIsTablet,
} from "@/context/DeviceContext";
import { DATE_FORMAT, HEATMAP_OPTIONS } from "@/lib/constants";
import { Activity } from "@/lib/schema";
import { formatDuration } from "@/lib/utils";
import { ROUTES } from "@/routing/constants";
import { useMapStore } from "@/store/mapStore";

import ActivityWeather from "../activity/ActivityWeather";
import DataChart from "../activity/DataChart";

export default memo(function MapSidePanel({
  activity,
  open = true,
}: {
  activity: Activity;
  open?: boolean;
}) {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isLandscape = useIsLandscape();
  const {
    hoveredPoint,
    setHoveredPoint,
    heatMapField,
    setHeatMapField,
    selectedActivityId,
    activityListInBounds,
    setHoveredActivity,
    setSelectedActivityId,
    setShowSideBar,
  } = useMapStore(
    useShallow((state) => ({
      hoveredPoint: state.hoveredPoint,
      setHoveredPoint: state.setHoveredPoint,
      heatMapField: state.heatMapField,
      setHeatMapField: state.setHeatMapField,
      selectedActivityId: state.selectedActivityId,
      activityListInBounds: state.activityListInBounds,
      setHoveredActivity: state.setHoveredActivity,
      setSelectedActivityId: state.setSelectedActivityId,
      setShowSideBar: state.setShowSideBar,
    })),
  );

  const selectedPoints =
    activityListInBounds.find((a) => a.id === selectedActivityId)?.points ?? [];

  const close = () => {
    setHoveredActivity(null);
    setSelectedActivityId(null);
    setShowSideBar(false);
  };

  const content = (
    <>
      <div className="flex items-start justify-between px-4 py-3 border-b border-ui-line">
        <div className="min-w-0 font-condensed">
          <h2 className="text-base font-bold uppercase tracking-wide text-ui-hi truncate">
            {activity.name}
          </h2>
          <p className="font-mono text-2xs text-ui-muted mt-0.5">
            {format(activity.startDate!, DATE_FORMAT)}
          </p>
        </div>
        <button
          onClick={close}
          className="text-ui-dim hover:text-ui-base ml-3 mt-0.5 shrink-0 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="px-4 py-3 flex flex-col gap-3 flex-1 overflow-y-auto">
        <ActivityWeather activity={activity} />

        <div className="grid grid-cols-2 gap-px bg-ui-line border border-ui-line">
          {[
            { label: "DISTANCE", value: `${(activity.distance / 1000).toFixed(1)} km` },
            { label: "DURÉE", value: formatDuration(activity.duration, false) },
            { label: "DÉNIVELÉ +", value: `${activity.elevationGain.toFixed(0)} m` },
            { label: "VITESSE MAX", value: `${activity.maxSpeed.toFixed(1)} km/h` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-background px-3 py-2">
              <p className="font-mono text-3xs tracking-widest text-ui-muted">{label}</p>
              <p className="font-condensed text-base font-bold text-ui-hi tabular-nums mt-0.5">
                {value}
              </p>
            </div>
          ))}
        </div>

        <div className="flex gap-1">
          {HEATMAP_OPTIONS.map(({ field, unit }) => (
            <button
              key={field}
              onClick={() => setHeatMapField(field, unit)}
              className={`flex-1 py-1 border font-mono text-3xs tracking-widest uppercase transition-all duration-150 ${
                heatMapField.field === field
                  ? "border-ui-muted text-ui-hi bg-ui-fill"
                  : "border-ui-line text-ui-muted hover:border-ui-dim hover:text-ui-base"
              }`}
            >
              {field.charAt(0).toUpperCase() + field.slice(1)}
            </button>
          ))}
        </div>

        <DataChart
          pointList={selectedPoints}
          onHover={(point) => setHoveredPoint(point)}
          hoveredPoint={
            hoveredPoint?.activityId === activity.id ? hoveredPoint : null
          }
          dataKey={heatMapField.field}
          unit={heatMapField.unit}
        />

        {activity?.activitySummits && activity.activitySummits.length > 0 && (
          <div className="flex gap-1">
            {activity.activitySummits
              .map((as) => as.summit)
              .map((summit) => (
                <div key={summit.id} className="flex-1 border border-ui-line px-3 py-2">
                  <p className="font-condensed text-sm font-bold text-ui-hi">{summit.name}</p>
                  <p className="font-mono text-2xs text-ui-muted tabular-nums">{summit.elevation} m</p>
                </div>
              ))}
          </div>
        )}
      </div>

      <div className="px-4 py-3 border-t border-ui-line">
        <Link
          href={ROUTES.activity(activity.id)}
          className="block w-full py-2 text-center font-condensed text-sm font-bold uppercase tracking-widest border border-ui-line text-ui-base hover:border-ui-muted hover:text-ui-hi transition-colors"
        >
          Voir l'activité
        </Link>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <Drawer
        modal={false}
        open={open}
        onClose={close}
        direction={isLandscape || isTablet ? "right" : "bottom"}
      >
        <DrawerContent
          className={
            !isLandscape && !isTablet
              ? "max-h-[30dvh] z-1002 px-5"
              : "z-1002 px-5"
          }
        >
          <VisuallyHidden>
            <DrawerTitle>{activity.name}</DrawerTitle>
          </VisuallyHidden>
          {content}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <div
      className={`absolute top-0 right-0 h-full w-80 bg-background border-l shadow-xl z-1000 flex flex-col overflow-y-auto transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
    >
      {content}
    </div>
  );
});
