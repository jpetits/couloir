import { Suspense } from "react";

import { format } from "date-fns";

import ActivityDetailClient from "@/app/ui/activity/ActivityDetailClient";
import ActivityImages from "@/app/ui/activity/ActivityImages";
import ActivityName from "@/app/ui/activity/ActivityName";
import ActivityWeather from "@/app/ui/activity/ActivityWeather";
import BackButton from "@/app/ui/dashboard/BackButton";
import { DATE_FORMAT } from "@/lib/constants";
import { fetchActivity } from "@/lib/data";
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
      <p>
        {format(activity.startDate, DATE_FORMAT)}
        <ActivityWeather activity={activity} />
      </p>
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
      <Suspense fallback={<p>Loading photos...</p>}>
        <ActivityImages activity={activity} />
      </Suspense>
      {activity.points && activity.points.length > 0 && (
        <ActivityDetailClient activity={{ ...activity, points: activity.points }} />
      )}
    </main>
  );
}
