import { fetchActivities } from "@/lib/data";
import { ROUTES } from "@/routing/constants";
import ActivityList from "@/app/ui/activity/activityList";
import UploadButton from "@/app/ui/activity/uploadButton";

export default async function Activities() {
  const data = await fetchActivities(1);

  return (
    <>
      <UploadButton />
      <ActivityList
        initialActivityList={data}
        fetchMorePath={ROUTES.api.activities(2)}
      />
    </>
  );
}
