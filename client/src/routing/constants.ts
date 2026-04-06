import { ActivityFilters, ActivityApiParamsSchema } from "@/lib/schema";

export const ROUTES = {
  home: "/",
  activities: "/activities",
  activity: (id: string) => `/activities/${id}`,
  signIn: "/sign-in",
  api: {
    activities: (filters: ActivityFilters) =>
      `/api/activities?${new URLSearchParams(JSON.parse(JSON.stringify(ActivityApiParamsSchema.parse(filters))))}`,
    activity: (id: string) => `/api/activities/${id}`,
    stats: `/api/activities/stats`,
    patchActivity: (id: string) => `/api/activities/${id}`,
    deleteActivity: (id: string) => `/api/activities/${id}`,
    postActivity: `/api/activities`,
    stravaSync: `/api/strava/sync`,
    stravaConnect: `/api/strava/callback`,
  },
  external: {
    stravaAuth: (redirect: string) =>
      `https://www.strava.com/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(redirect)}&approval_prompt=force&scope=read,activity:read_all`,
  },
} as const;
