import { fetchActivity } from "@/lib/data";
import ActivityDetailClient from "@/app/ui/activity/ActivityDetailClient";
import BackButton from "@/app/ui/dashboard/BackButton";
import ActivityName from "@/app/ui/activity/ActivityName";
import { formatDuration } from "@/lib/utils";
import { format } from "date-fns";
import { DATE_FORMAT } from "@/lib/constants";
import { ROUTES } from "@/routing/constants";

export default async function ActivityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const activity = await fetchActivity(id);

  return (
    <main>
      <BackButton />
      <ActivityName activity={activity} />
      <p>{format(activity.startDate, DATE_FORMAT)}</p>
      <ul>
        <li>Durée : {formatDuration(activity.duration, false)}</li>
        <li>Distance : {(activity.distance / 1000).toFixed(1)} km</li>
        <li>Vitesse max : {activity.maxSpeed.toFixed(1)} km/h</li>
        <li>
          Vitesse moy :{" "}
          {(activity.distance / 1000 / (activity.duration / 3600)).toFixed(1)}{" "}
          km/h
        </li>
      </ul>
      {activity.images && activity.images.length > 0 && (
        <div>
          <h2>Photos</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {activity.images.map((image) => (
              <img
                key={image.id}
                src={ROUTES.api.imagePath(image.immichId, "thumbnail")}
                alt={`Image ${image.id}`}
                className="w-full h-auto"
              />
            ))}
          </div>
        </div>
      )}
      {activity.points && activity.points.length > 0 && (
        <ActivityDetailClient activity={activity} />
      )}
    </main>
  );
}
