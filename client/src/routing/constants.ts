import {
  ActivityFilters,
  ActivityApiParamsSchema,
  MapBounds,
  MapBoundsSchema,
} from "@/lib/schema";

export const ROUTES = {
  home: "/",
  activities: "/activities",
  stats: "/stats",
  activity: (id: string) => `/activities/${id}`,
  signIn: "/sign-in",
  signUp: "/sign-up",
  api: {
    activities: (filters: ActivityFilters) =>
      `/api/activities?${new URLSearchParams(JSON.parse(JSON.stringify(ActivityApiParamsSchema.parse(filters))))}`,
    activity: (id: string) => `/api/activities/${id}`,
    stats: `/api/activities/stats`,
    map: (bounds: MapBounds, excludeActivityIds: string[] = [], zoom: number) =>
      `/api/activities/map?${new URLSearchParams({
        ...JSON.parse(JSON.stringify(MapBoundsSchema.parse(bounds))),
        excludeActivityIds: excludeActivityIds.join(","),
        zoom: zoom.toString(),
      })}`,
    patchActivity: (id: string) => `/api/activities/${id}`,
    deleteActivity: (id: string) => `/api/activities/${id}`,
    postActivity: `/api/activities`,
    stravaSync: `/api/strava/sync`,
    stravaConnect: `/api/strava/callback`,
    userMe: `/api/user/me`,
    publicStats: (username: string) => `/api/public/${username}/stats`,
    publicActivities: (username: string) =>
      `/api/public/${username}/activities`,
  },
  external: {
    stravaAuth: (redirect: string) =>
      `https://www.strava.com/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(redirect)}&approval_prompt=force&scope=read,activity:read_all`,
  },
} as const;
