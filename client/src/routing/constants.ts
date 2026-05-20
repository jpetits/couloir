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
    search: (query: string) =>
      `/api/activities/search?q=${encodeURIComponent(query)}`,
    stats: `/api/activities/stats`,
    map: (bounds: MapBounds, excludeActivityIds: string[] = [], zoom: number) =>
      `/api/activities/map?${new URLSearchParams({
        ...JSON.parse(JSON.stringify(MapBoundsSchema.parse(bounds))),
        excludeActivityIds: excludeActivityIds.join(","),
        zoom: zoom.toString(),
      })}`,
    publicMap: (
      username: string,
      bounds: MapBounds,
      excludeActivityIds: string[] = [],
      zoom: number,
    ) =>
      `/api/public/${username}/map?${new URLSearchParams({
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
    user: (username: string) => `/api/user/${username}`,
    userPatch: () => `/api/user`,
    publicStats: (username: string) => `/api/public/${username}/stats`,
    publicActivities: (username: string) =>
      `/api/public/${username}/activities`,
    imagePath: (imageId: string, size: AssetMediaSize = "thumbnail") =>
      `/api/public/assets/${imageId}/thumbnail?size=${size}`,
  },
  external: {
    stravaAuth: (redirect: string) =>
      `https://www.strava.com/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(redirect)}&approval_prompt=force&scope=read,activity:read_all`,
  },
} as const;
