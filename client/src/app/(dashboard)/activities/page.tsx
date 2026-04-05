import { fetchActivities } from "@/lib/data";
import ActivityList from "@/app/ui/activity/ActivityList";
import UploadButton from "@/app/ui/activity/UploadButton";
import { ActivityFiltersSchema } from "@/lib/schema";

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
      <h1 className="text-2xl font-bold mb-4">Mes activités</h1>
      <UploadButton />
      <ActivityList initialActivityList={data} />
    </>
  );
}
