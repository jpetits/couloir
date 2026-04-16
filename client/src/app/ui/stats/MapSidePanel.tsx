"use client";

import { format } from "date-fns";
import Link from "next/link";
import { useShallow } from "zustand/react/shallow";

import { Button } from "@/components/ui/button";
import { DATE_FORMAT, HEATMAP_OPTIONS } from "@/lib/constants";
import { Activity } from "@/lib/schema";
import { formatDuration } from "@/lib/utils";
import { ROUTES } from "@/routing/constants";
import { useMapStore } from "@/store/mapStore";

import ActivityWeather from "../activity/ActivityWeather";
import DataChart from "../activity/DataChart";

export default function MapSidePanel({ activity }: { activity: Activity }) {
  const {
    hoveredPoint,
    setHoveredPoint,
    heatMapField,
    setHeatMapField,
    hoveredActivityPoints,
  } = useMapStore(
    useShallow((state) => ({
      hoveredPoint: state.hoveredPoint,
      setHoveredPoint: state.setHoveredPoint,
      heatMapField: state.heatMapField,
      setHeatMapField: state.setHeatMapField,
      hoveredActivityPoints: state.hoveredActivityPoints,
    })),
  );

  return (
    <div className="absolute bottom-0 left-0 right-0 md:bottom-auto md:left-auto md:top-0 md:right-0 md:h-full md:w-80 md:border-l bg-background border-t md:border-t-0 shadow-xl z-1000 flex flex-col max-h-[50dvh] md:max-h-full overflow-y-auto">
      <div className="flex-row items-top justify-between p-4 border-b">
        <h2 className="font-semibold text-sm truncate">{activity.name}</h2>
        <p className="text-muted-foreground text-sm">
          {format(activity.startDate!, DATE_FORMAT)}
        </p>
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
              className="cursor-pointer  flex-1"
              size="sm"
              onClick={() => setHeatMapField(field, unit)}
            >
              {field.charAt(0).toUpperCase() + field.slice(1)}
            </Button>
          ))}
        </div>
        <DataChart
          pointList={hoveredActivityPoints}
          onHover={(point) => setHoveredPoint(point)}
          hoveredPoint={hoveredPoint}
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
      <div className="p-4 border-t">
        <Link href={ROUTES.activity(activity.id)}>
          <Button className="w-full cursor-pointer" size="sm">
            Voir l'activité
          </Button>
        </Link>
      </div>
    </div>
  );
}
