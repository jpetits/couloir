import { fetchActivities } from "@/lib/data";
import { ROUTES } from "@/routing/constants";
import ActivityList from "@/app/ui/activity/activityList";
import UploadButton from "@/app/ui/activity/uploadButton";
import { Activity, ActivityFiltersSchema } from "@/lib/schema";

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
      <UploadButton />
      <ActivityList initialActivityList={data} />
    </>
  );
}
