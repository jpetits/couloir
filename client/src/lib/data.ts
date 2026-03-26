import { apiFetch } from "./api";
import { Activity, ActivityListSchema, ActivitySchema } from "./schema";

export async function fetchActivities(page = 1): Promise<Activity[]> {
  return await apiFetch<Activity[]>("/api/activities?page=" + page).then(
    (data) => ActivityListSchema.parse(data),
  );
}

export async function fetchActivity(id: string): Promise<Activity> {
  const activity = await apiFetch<Activity>("/api/activities/" + id).then(
    (data) => ActivitySchema.parse(data),
  );
  return activity;
}
