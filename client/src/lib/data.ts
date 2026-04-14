import { ROUTES } from "@/routing/constants";

import { apiFetch } from "./api";
import {
  Activity,
  ActivityFilters,
  ActivityListSchema,
  ActivitySchema,
  ActivityStats,
  ActivityStatsSchema,
} from "./schema";

export async function fetchActivities(
  filters: ActivityFilters = {},
): Promise<Activity[]> {
  return await apiFetch<Activity[]>(ROUTES.api.activities(filters)).then(
    (data) => ActivityListSchema.parse(data),
  );
}

export async function fetchActivity(id: string): Promise<Activity> {
  const activity = await apiFetch<Activity>(ROUTES.api.activity(id)).then(
    (data) => ActivitySchema.parse(data),
  );
  return activity;
}

export async function fetchStats(): Promise<ActivityStats> {
  const stats = await apiFetch<ActivityStats>(ROUTES.api.stats).then((data) =>
    ActivityStatsSchema.parse(data),
  );
  return stats;
}

export async function userIsStravaConnected(): Promise<boolean> {
  const res = await apiFetch<{ stravaConnected: boolean }>(ROUTES.api.userMe);
  return res.stravaConnected;
}

export async function fetchPublicActivities(
  username: string,
): Promise<Activity[]> {
  const res = await apiFetch<Activity[]>(ROUTES.api.publicActivities(username));
  return ActivityListSchema.parse(res);
}
