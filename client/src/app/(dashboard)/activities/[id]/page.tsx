import { fetchActivity } from "@/lib/data";
import ActivityDetailClient from "@/app/ui/activity/activityDetailClient";
import BackButton from "@/app/ui/dashboard/backButton";
import ActivityName from "@/app/ui/activity/activityName";
import { formatDuration } from "@/lib/utils";

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
      <p>{activity.date}</p>
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
      {activity.points && activity.points.length > 0 && (
        <ActivityDetailClient points={activity.points} />
      )}
    </main>
  );
}
