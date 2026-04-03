import { postActivity } from "@/lib/data.client";
import { ActivityFilters } from "@/lib/schema";

export const ROUTES = {
  home: "/",
  activities: "/activities",
  activity: (id: string) => `/activities/${id}`,
  api: {
    activities: (filters?: ActivityFilters) =>
      `/api/activities?${new URLSearchParams(filters).toString()}`,
    activity: (id: string) => `/api/activities/${id}`,
    stats: `/api/activities/stats`,
    patchActivity: (id: string) => `/api/activities/${id}`,
    deleteActivity: (id: string) => `/api/activities/${id}`,
    postActivity: () => `/api/activities`,
  },
} as const;
