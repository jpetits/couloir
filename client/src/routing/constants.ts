export const ROUTES = {
  home: "/",
  activities: "/activities",
  activity: (id: string) => `/activities/${id}`,
  api: {
    activities: (page: number) => `/api/activities?page=${page}`,
    activity: (id: string) => `/api/activities/${id}`,
    stats: `/api/activities/stats`,
  },
} as const;
