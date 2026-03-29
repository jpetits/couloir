import StatsCard from "@/app/ui/stats/card";
import { fetchStats } from "@/lib/data";
import { formatDuration } from "@/lib/utils";

export default async function StatsPage() {
  const stats = await fetchStats();

  return (
    <div>
      <h1 className="text-2xl font-bold">Stats</h1>
      <StatsCard title="Nombre d'activités">
        <p className="text-3xl font-bold">{stats.count}</p>
        <p className="text-sm text-muted-foreground">ce mois-ci</p>
      </StatsCard>
      <StatsCard title="Distance totale">
        <p className="text-3xl font-bold">
          {(stats.totalDistance / 1000).toFixed(1)} km
        </p>
        <p className="text-sm text-muted-foreground">ce mois-ci</p>
      </StatsCard>
      <StatsCard title="Dénivelé total">
        <p className="text-3xl font-bold">{stats.totalElevationLoss} m</p>
        <p className="text-sm text-muted-foreground">ce mois-ci</p>
      </StatsCard>
      <StatsCard title="Durée totale">
        <p className="text-3xl font-bold">
          {formatDuration(stats.totalDuration, false)}
        </p>
        <p className="text-sm text-muted-foreground">ce mois-ci</p>
      </StatsCard>
    </div>
  );
}
