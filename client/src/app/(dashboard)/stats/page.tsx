import { CardSkeleton } from "@/app/ui/skeletons";
import ActivityStats from "@/app/ui/stats/activityStats";
import StatsCard from "@/app/ui/stats/card";
import { fetchStats } from "@/lib/data";
import { formatDuration } from "@/lib/utils";
import { Suspense } from "react";

export default async function StatsPage() {
  const stats = await fetchStats();

  console.log("StatsPage stats:", stats);

  return (
    <div>
      <h1 className="text-2xl font-bold">Stats</h1>
      <Suspense fallback={<CardSkeleton />}>
        <StatsCard title="Nombre d'activités">
          <p className="text-3xl font-bold">{stats.count}</p>
          <p className="text-sm text-muted-foreground">ce mois-ci</p>
        </StatsCard>
      </Suspense>
      <Suspense fallback={<CardSkeleton />}>
        <StatsCard title="Distance totale">
          <p className="text-3xl font-bold">
            {(stats.totalDistance / 1000).toFixed(1)} km
          </p>
          <p className="text-sm text-muted-foreground">ce mois-ci</p>
        </StatsCard>
      </Suspense>
      <Suspense fallback={<CardSkeleton />}>
        <StatsCard title="Dénivelé total">
          <p className="text-3xl font-bold">{stats.totalElevationLoss} m</p>
          <p className="text-sm text-muted-foreground">ce mois-ci</p>
        </StatsCard>
      </Suspense>
      <Suspense fallback={<CardSkeleton />}>
        <StatsCard title="Durée totale">
          <p className="text-3xl font-bold">
            {formatDuration(stats.totalDuration, false)}
          </p>
          <p className="text-sm text-muted-foreground">ce mois-ci</p>
        </StatsCard>
      </Suspense>

      <ActivityStats stats={stats} />
    </div>
  );
}
