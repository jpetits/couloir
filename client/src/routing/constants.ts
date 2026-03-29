import { postActivity } from "@/lib/data.client";

export const ROUTES = {
  home: "/",
  activities: "/activities",
  activity: (id: string) => `/activities/${id}`,
  api: {
    activities: (page: number) => `/api/activities?page=${page}`,
    activity: (id: string) => `/api/activities/${id}`,
    stats: `/api/activities/stats`,
    patchActivity: (id: string) => `/api/activities/${id}`,
    deleteActivity: (id: string) => `/api/activities/${id}`,
    postActivity: () => `/api/activities`,
  },
} as const;
