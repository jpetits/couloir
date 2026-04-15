import { Suspense } from "react";

import StatsCard from "@/app/ui/stats/StatsCard";
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
  return (
    <>
      <h1 className="text-2xl font-bold flex-warp">Statistiques</h1>
      <div className="flex flex-col md:flex-row gap-4 mt-2">
        <StatsCard title="Nombre d'activités">
          <p className="text-3xl font-bold">{stats.count}</p>
          <p className="text-sm text-muted-foreground">cette année</p>
        </StatsCard>
        <StatsCard title="Distance totale">
          <p className="text-3xl font-bold">
            {(stats.totalDistance / 1000).toFixed(1)} km
          </p>
          <p className="text-sm text-muted-foreground">cette année</p>
        </StatsCard>
        <StatsCard title="Dénivelé total">
          <p className="text-3xl font-bold">{stats.totalElevationLoss} m</p>
          <p className="text-sm text-muted-foreground">cette année</p>
        </StatsCard>
        <StatsCard title="Durée totale">
          <p className="text-3xl font-bold">
            {formatDuration(stats.totalDuration, false)}
          </p>
          <p className="text-sm text-muted-foreground">cette année</p>
        </StatsCard>
      </div>
      <Suspense
        fallback={
          <div className="mt-6 text-muted-foreground">
            Chargement de la carte...
          </div>
        }
      >
        <StatsMap />
      </Suspense>
    </>
  );
}
