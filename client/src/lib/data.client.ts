import type { Activity } from "./schema";
import { ActivitySchema } from "./schema";

export type ApiFetch = <T>(path: string, options?: RequestInit) => Promise<T>;

export const deleteActivity = (apiFetch: ApiFetch, id: string): Promise<void> =>
  apiFetch(`/api/activities/${id}`, { method: "DELETE" });

export const postActivity = (apiFetch: ApiFetch, file: File): Promise<Activity> => {
  const formData = new FormData();
  formData.append("file", file);
  return apiFetch<Activity>("/api/activities", { method: "POST", body: formData }).then(
    (data) => ActivitySchema.parse(data),
  );
};
