import ActivityList from "@/app/ui/activityList/ActivityList";
import BackButton from "@/app/ui/dashboard/BackButton";
import StatsButton from "@/app/ui/dashboard/StatsButton";
import StravaConnectButton from "@/app/ui/dashboard/StravaConnectButton";
import StravaSyncButton from "@/app/ui/dashboard/StravaSyncButton";
import UploadButton from "@/app/ui/dashboard/UploadButton";
import { fetchActivities, userIsStravaConnected } from "@/lib/data";
import { ActivityFiltersSchema } from "@/lib/schema";

export default async function Activities({
  searchParams,
}: {
  searchParams: Promise<typeof ActivityFiltersSchema>;
}) {
  const filters = await searchParams;
  const parsedFilters = ActivityFiltersSchema.parse(filters || {});
  const data = await fetchActivities(parsedFilters);
  const isStravaConnected = await userIsStravaConnected();

  return (
    <div style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
      <div className="flex items-end justify-between pb-4 mb-1 border-b border-[#1a1a1a]">
        <div className="flex items-baseline gap-4">
          <BackButton />
          <h1 className="text-4xl font-bold tracking-wider uppercase text-[#f0ebe0]">
            Activités
          </h1>
          <span
            className="text-[11px] text-[#444] tracking-widest"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {data.length} logged
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
