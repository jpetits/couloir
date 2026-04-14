import { toast } from "sonner";

import { ROUTES } from "@/routing/constants";

import type { Activity, MapBounds, MapPointsResponse } from "./schema";
import { ActivitySchema } from "./schema";

export type ApiFetch = <T>(path: string, options?: RequestInit) => Promise<T>;

export const deleteActivity = (
  apiFetch: ApiFetch,
  id: string,
): Promise<void> => {
  return apiFetch(ROUTES.api.deleteActivity(id), { method: "DELETE" });
};

export const postActivity = (
  apiFetch: ApiFetch,
  file: File,
): Promise<Activity> => {
  const formData = new FormData();
  formData.append("file", file);

  return apiFetch<Activity>(ROUTES.api.postActivity, {
    method: "POST",
    body: formData,
  }).then((data) => ActivitySchema.parse(data));
};

export const patchActivity = (
  apiFetch: ApiFetch,
  id: string,
  fields: Partial<Activity>,
): Promise<Activity> => {
  return apiFetch<Activity>(ROUTES.api.patchActivity(id), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fields),
  }).then((data) => ActivitySchema.parse(data));
};

export const stravaConnect = (apiFetch: ApiFetch, code: string) => {
  return apiFetch(ROUTES.api.stravaConnect, {
    method: "POST",
    body: JSON.stringify({ code }),
  })
    .then(() =>
      toast(
        "Strava account connected! Your activities will be synced shortly.",
      ),
    )
    .catch(() =>
      toast(
        "Failed to connect Strava account. Please try again or contact support.",
      ),
    );
};

export async function fetchActivitiesWithPointsInBounds(
  apiFetch: ApiFetch,
  bounds: MapBounds,
  excludeActivityIds: string[] = [],
  zoom: number,
): Promise<MapPointsResponse> {
  return await apiFetch<MapPointsResponse>(
    ROUTES.api.map(bounds, excludeActivityIds, zoom),
    // ).then((data) => MapPointsResponseSchema.parse(data));
  ).then((data) => data);
}
