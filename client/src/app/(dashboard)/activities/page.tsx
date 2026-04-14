import ActivityList from "@/app/ui/activity/ActivityList";
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
    <>
      <BackButton />
      <h1 className="text-2xl font-bold mb-4">Mes activités</h1>
      <div className="flex gap-2 mb-4">
        <UploadButton />
        {!isStravaConnected && <StravaConnectButton />}
        {isStravaConnected && <StravaSyncButton />}
        <StatsButton />
      </div>
      <ActivityList initialActivityList={data} />
    </>
  );
}
