import { fetchActivities } from "@/lib/data";
import ActivityList from "@/app/ui/activity/ActivityList";
import UploadButton from "@/app/ui/dashboard/UploadButton";
import { ActivityFiltersSchema } from "@/lib/schema";
import StravaSyncButton from "@/app/ui/dashboard/StravaSyncButton";
import StravaConnectButton from "@/app/ui/dashboard/StravaConnectButton";
import StatsButton from "@/app/ui/dashboard/StatsButton";
import BackButton from "@/app/ui/dashboard/BackButton";

export default async function Activities({
  searchParams,
}: {
  searchParams: Promise<typeof ActivityFiltersSchema>;
}) {
  const filters = await searchParams;

  const parsedFilters = ActivityFiltersSchema.parse(filters || {});

  const data = await fetchActivities(parsedFilters);

  return (
    <>
      <BackButton />
      <h1 className="text-2xl font-bold mb-4">Mes activités</h1>
      <div className="flex gap-2 mb-4">
        <UploadButton />
        <StravaConnectButton />
        <StravaSyncButton />
        <StatsButton />
      </div>
      <ActivityList initialActivityList={data} />
    </>
  );
}
