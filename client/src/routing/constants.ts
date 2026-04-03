import { ActivityFilters, ActivityApiParamsSchema } from "@/lib/schema";

export const ROUTES = {
  home: "/",
  activities: "/activities",
  activity: (id: string) => `/activities/${id}`,
  api: {
    activities: (filters: ActivityFilters) =>
      `/api/activities?${new URLSearchParams(JSON.parse(JSON.stringify(ActivityApiParamsSchema.parse(filters))))}`,
    activity: (id: string) => `/api/activities/${id}`,
    stats: `/api/activities/stats`,
    patchActivity: (id: string) => `/api/activities/${id}`,
    deleteActivity: (id: string) => `/api/activities/${id}`,
    postActivity: () => `/api/activities`,
  },
} as const;
