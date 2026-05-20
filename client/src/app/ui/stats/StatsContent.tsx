import { Suspense } from "react";

import BackButton from "@/app/ui/dashboard/BackButton";
import { fetchActivities, fetchStats } from "@/lib/data";
import { formatDuration } from "@/lib/utils";

import ActivityStatsWrapper from "./ActivityStatsWrapper";

async function StatsMap() {
  const activityList = await fetchActivities({ limit: "10000" });
  const activityListWithCoords = activityList.filter(
    (a) => a.startLat !== null && a.startLng !== null,
  );
  return <ActivityStatsWrapper activityList={activityListWithCoords} />;
}

export default async function StatsContent() {
  const stats = await fetchStats();

  const metrics = [
    { value: stats.count.toString(), unit: "", label: "ACTIVITÉS" },
    {
      value: (stats.totalDistance / 1000).toFixed(0),
      unit: "km",
      label: "DISTANCE",
    },
    {
      value: Math.round(stats.totalElevationLoss).toLocaleString("fr"),
      unit: "m",
      label: "DÉNIVELÉ",
    },
    {
      value: formatDuration(stats.totalDuration, false),
      unit: "",
      label: "DURÉE",
    },
  ];

  return (
    <div className="font-condensed -mx-4 md:-mx-6">
      <div className="flex items-end justify-between px-4 md:px-6 pb-4 border-b border-ui-line">
        <div className="flex items-baseline gap-4">
          <BackButton />
          <h1 className="text-4xl font-bold tracking-wider uppercase text-ui-hi">
            Statistiques
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 border-b border-ui-line">
        {metrics.map(({ value, unit, label }, i) => (
          <div
            key={i}
            className="py-5 px-4 md:px-6 border-r border-ui-line last:border-r-0 nth-[-n+2]:border-b md:nth-[-n+2]:border-b-0"
          >
            <div className="text-4xl font-bold tabular-nums text-ui-hi leading-none">
              {value}
              {unit && (
                <span className="text-lg font-normal text-ui-dim ml-1">
                  {unit}
                </span>
              )}
            </div>
            <div className="font-mono text-3xs tracking-widest text-ui-muted mt-2">
              {label}
            </div>
          </div>
        ))}
      </div>

      <Suspense
        fallback={
          <div className="h-96 flex items-center justify-center font-mono text-2xs tracking-widest text-ui-dim animate-pulse">
            CHARGEMENT DE LA CARTE…
          </div>
        }
      >
        <StatsMap />
      </Suspense>
    </div>
  );
}
