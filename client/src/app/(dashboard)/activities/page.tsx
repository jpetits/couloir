import ActivityList from "@/app/ui/activityList/ActivityList";
import StatsButton from "@/app/ui/dashboard/StatsButton";
import StravaConnectButton from "@/app/ui/dashboard/StravaConnectButton";
import StravaSyncButton from "@/app/ui/dashboard/StravaSyncButton";
import UploadButton from "@/app/ui/dashboard/UploadButton";
import { fetchActivities, fetchStats, userIsStravaConnected } from "@/lib/data";
import { ActivityFiltersSchema } from "@/lib/schema";

export default async function Activities({
  searchParams,
}: {
  searchParams: Promise<typeof ActivityFiltersSchema>;
}) {
  const filters = await searchParams;
  const parsedFilters = ActivityFiltersSchema.parse(filters || {});
  const [data, stats, isStravaConnected] = await Promise.all([
    fetchActivities(parsedFilters),
    fetchStats(),
    userIsStravaConnected(),
  ]);

  return (
    <div className="font-condensed">
      <div className="flex flex-wrap items-end justify-between gap-y-3 pb-4 mb-1 border-b border-ui-line">
        <div className="flex items-baseline gap-4">
          <h1 className="text-4xl font-bold tracking-wider uppercase text-ui-hi">
            Activités
          </h1>
          <span className="font-mono text-xs text-ui-muted tracking-widest">
            {stats.count} logged
          </span>
        </div>
        <div className="flex gap-2 items-center">
          <UploadButton />
          {!isStravaConnected && <StravaConnectButton />}
          {isStravaConnected && <StravaSyncButton />}
          <StatsButton />
        </div>
      </div>
      <ActivityList initialActivityList={data} />
    </div>
  );
}
