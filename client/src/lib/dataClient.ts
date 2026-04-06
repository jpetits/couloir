import { ROUTES } from "@/routing/constants";
import type { Activity } from "./schema";
import { ActivitySchema } from "./schema";
import { toast } from "sonner";

export type ApiFetch = <T>(path: string, options?: RequestInit) => Promise<T>;

export const deleteActivity = (apiFetch: ApiFetch, id: string): Promise<void> =>
  apiFetch(ROUTES.api.deleteActivity(id), { method: "DELETE" });

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
): Promise<Activity> =>
  apiFetch<Activity>(ROUTES.api.patchActivity(id), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fields),
  }).then((data) => ActivitySchema.parse(data));

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

export const stravaSync = (apiFetch: ApiFetch) => {
  return apiFetch(ROUTES.api.stravaSync, {
    method: "POST",
  })
    .then(() => toast("Strava activities synced!"))
    .catch(() =>
      toast(
        "Failed to sync Strava activities. Please try again or contact support.",
      ),
    );
};
