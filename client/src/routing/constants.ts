export const ROUTES = {
  home: "/",
  activities: "/activities",
  activity: (id: string) => `/activities/${id}`,
  api: {
    activities: "/api/activities",
    activity: (id: string) => `/api/activities/${id}`,
  },
} as const;
