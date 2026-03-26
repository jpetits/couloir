export const ROUTES = {
  home: "/",
  activities: "/activities",
  activity: (id: string) => `/activities/${id}`,
  api: {
    activities: `${process.env.NEXT_PUBLIC_API_URL}/api/activities`,
    activity: (id: string) =>
      `${process.env.NEXT_PUBLIC_API_URL}/api/activities/${id}`,
  },
} as const;
