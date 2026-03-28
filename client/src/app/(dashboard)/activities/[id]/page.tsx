import { notFound } from "next/navigation";
import { fetchActivity } from "@/lib/data";
import ActivityMapWrapper from "@/app/ui/activity/activityMapWrapper";
import BackButton from "@/app/ui/dashboard/backButton";

export default async function ActivityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!id) {
    notFound();
  }
  const activity = await fetchActivity(id);
  if (!activity) {
    notFound();
  }

  return (
    <main>
      <BackButton />
      <h1>{activity.id}</h1>
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
      <p>{activity.points?.length} points GPS enregistrés</p>
      {activity.points && activity.points.length > 0 && (
        <ActivityMapWrapper points={activity.points} />
      )}
    </main>
  );
}
