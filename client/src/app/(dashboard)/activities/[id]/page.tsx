import { fetchActivity } from "@/lib/data";
import ActivityDetailClient from "@/app/ui/activity/activityDetailClient";
import BackButton from "@/app/ui/dashboard/backButton";
import ActivityName from "@/app/ui/activity/activityName";

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
        <li>Durée : {Math.round(activity.duration / 60)} min</li>
        <li>Distance : {(activity.distance / 1000).toFixed(1)} km</li>
        <li>Dénivelé : {Math.round(activity.elevGain)} m</li>
        <li>Vitesse max : {activity.maxSpeed.toFixed(1)} km/h</li>
        <li>
          Vitesse moy :{" "}
          {(activity.distance / (activity.duration / 3600)).toFixed(1)} km/h
        </li>
      </ul>
      {activity.points && activity.points.length > 0 && (
        <ActivityDetailClient points={activity.points} />
      )}
    </main>
  );
}
