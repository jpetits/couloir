"use client";

import { memo } from "react";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { format } from "date-fns";
import { X } from "lucide-react";
import Link from "next/link";
import { useShallow } from "zustand/react/shallow";

import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { useIsMobile } from "@/context/DeviceContext";
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
      <div className="flex items-start justify-between p-4 border-b">
        <div>
          <h2 className="font-semibold text-sm truncate">{activity.name}</h2>
          <p className="text-muted-foreground text-sm">
            {format(activity.startDate!, DATE_FORMAT)}
          </p>
        </div>
        <button
          onClick={close}
          className="text-muted-foreground hover:text-foreground ml-2 mt-0.5"
        >
          <X className="w-4 h-4 hover:cursor-pointer" />
        </button>
      </div>
      <div className="p-4 flex flex-col gap-3 text-sm flex-1 overflow-y-auto">
        <p className="text-muted-foreground">
          <ActivityWeather activity={activity} />
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-muted rounded p-2">
            <p className="text-xs text-muted-foreground">Distance</p>
            <p className="font-semibold">
              {(activity.distance / 1000).toFixed(1)} km
            </p>
          </div>
          <div className="bg-muted rounded p-2">
            <p className="text-xs text-muted-foreground">Durée</p>
            <p className="font-semibold">
              {formatDuration(activity.duration, false)}
            </p>
          </div>
          <div className="bg-muted rounded p-2">
            <p className="text-xs text-muted-foreground">Dénivelé +</p>
            <p className="font-semibold">
              {activity.elevationGain.toFixed(0)} m
            </p>
          </div>
          <div className="bg-muted rounded p-2">
            <p className="text-xs text-muted-foreground">Vitesse max</p>
            <p className="font-semibold">{activity.maxSpeed.toFixed(1)} km/h</p>
          </div>
        </div>
        <div className="flex gap-2">
          {HEATMAP_OPTIONS.map(({ field, unit }) => (
            <Button
              key={field}
              variant={heatMapField.field === field ? "default" : "outline"}
              className="cursor-pointer flex-1"
              size="sm"
              onClick={() => setHeatMapField(field, unit)}
            >
              {field.charAt(0).toUpperCase() + field.slice(1)}
            </Button>
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
        <div className="flex gap-2">
          {activity?.activitySummits
            ?.map((as) => as.summit)
            .map((summit) => (
              <div key={summit.id} className="bg-muted rounded p-2 flex-1">
                <p className="font-semibold">{summit.name}</p>
                <p className="text-sm text-muted-foreground">
                  {summit.elevation} m
                </p>
              </div>
            ))}
        </div>
      </div>
      <div className="p-4 border-t w-[90%] mx-auto">
        <Link href={ROUTES.activity(activity.id)}>
          <Button className="w-full cursor-pointer" size="sm">
            Voir l'activité
          </Button>
        </Link>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <Drawer modal={false} open={open} onClose={close}>
        <DrawerContent className="max-h-[30dvh] z-1002 px-5">
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
