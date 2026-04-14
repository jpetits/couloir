import {
  ActivityApiParamsSchema,
  ActivityFilters,
  MapBounds,
  MapBoundsSchema,
} from "@/lib/schema";
import { AssetMediaSize } from "@/types/image";

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
    deleteActivity: `/api/activities`,
    postActivity: `/api/activities`,
    stravaSync: `/api/strava/sync`,
    stravaConnect: `/api/strava/callback`,
    userMe: `/api/user/me`,
    publicStats: (username: string) => `/api/public/${username}/stats`,
    publicActivities: (username: string) =>
      `/api/public/${username}/activities`,
    imagePath: (imageId: string, size: AssetMediaSize = "thumbnail") =>
      `${process.env.NEXT_PUBLIC_API_URL}/api/public/assets/${imageId}/thumbnail?size=${size}`,
  },
  external: {
    openMeteo: (
      activity: { startLat: number; startLng: number },
      date: string,
    ) =>
      `https://archive-api.open-meteo.com/v1/archive?latitude=${activity.startLat}&longitude=${activity.startLng}&start_date=${date}&end_date=${date}&hourly=temperature_2m,weathercode,windspeed_10m&timezone=UTC`,
    stravaAuth: (redirect: string) =>
      `https://www.strava.com/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(redirect)}&approval_prompt=force&scope=read,activity:read_all`,
  },
} as const;
