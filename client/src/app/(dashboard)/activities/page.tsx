import { fetchActivities } from "@/lib/data";
import { ROUTES } from "@/routing/constants";
import ActivityList from "@/app/ui/activity/activityList";

export default async function Activities() {
  const data = await fetchActivities(1);

  return (
    <ActivityList
      initialActivityList={data}
      fetchMorePath={ROUTES.api.activities}
    />
  );
}
