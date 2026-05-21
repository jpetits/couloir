import { Suspense } from "react";

import { format } from "date-fns";

import ActivityDetailClient from "@/components/activity/ActivityDetailClient";
import ActivityImages from "@/components/activity/ActivityImages";
import ActivityName from "@/components/activity/ActivityName";
import ActivityWeather from "@/components/activity/ActivityWeather";
import BackButton from "@/components/dashboard/BackButton";
import StatsCard from "@/components/stats/StatsCard";
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
      <p className="text-sm text-muted-foreground flex items-center gap-2">
        {format(activity.startDate, DATE_FORMAT)}
        <ActivityWeather activity={activity} />
      </p>
      <div className="flex flex-wrap gap-4 mt-4">
        <StatsCard title="Durée">
          <p className="text-3xl font-bold">
            {formatDuration(activity.duration, false)}
          </p>
        </StatsCard>

        <StatsCard title="Distance">
          <p className="text-3xl font-bold">
            {(activity.distance / 1000).toFixed(1)} km
          </p>
        </StatsCard>

        <StatsCard title="Vitesse max">
          <p className="text-3xl font-bold">
            {activity.maxSpeed.toFixed(1)} km/h
          </p>
        </StatsCard>

        <StatsCard title="Vitesse moyenne">
          <p className="text-3xl font-bold">
            {(activity.distance / 1000 / (activity.duration / 3600)).toFixed(1)}{" "}
            km/h
          </p>
        </StatsCard>
      </div>
      <Suspense fallback={<p>Loading photos...</p>}>
        <ActivityImages activity={activity} />
      </Suspense>
      {activity.points && activity.points.length > 0 && (
        <ActivityDetailClient
          activity={{ ...activity, points: activity.points }}
        />
      )}
    </main>
  );
}
