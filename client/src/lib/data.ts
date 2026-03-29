import { ROUTES } from "@/routing/constants";
import { apiFetch } from "./api";
import {
  Activity,
  ActivityListSchema,
  ActivitySchema,
  ActivityStats,
  ActivityStatsSchema,
} from "./schema";

export async function fetchActivities(page = 1): Promise<Activity[]> {
  return await apiFetch<Activity[]>(ROUTES.api.activities(page)).then((data) =>
    ActivityListSchema.parse(data),
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
