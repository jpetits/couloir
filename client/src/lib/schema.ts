import { z } from "zod";

export const ImageSchema = z.object({
  id: z.string(),
  activityId: z.string(),
  immichId: z.string(),
  lat: z.number(),
  lng: z.number(),
});

export const PointSchema = z.object({
  id: z.string(),
  activityId: z.string(),
  lat: z.number(),
  lng: z.number(),
  elevation: z.number(),
  speed: z.number(),
  heartrate: z.number(),
  time: z.coerce.date(),
  distance: z.number(),
  cumDistance: z.number(),
});

export type Point = z.infer<typeof PointSchema>;

export const SummitSchema = z.object({
  id: z.string(),
  osmId: z.string(),
  name: z.string().nullable(),
  lat: z.number(),
  lng: z.number(),
  elevation: z.number(),
});

export const ActivitySummitSchema = z.object({
  activityId: z.string(),
  summitId: z.string(),
  summit: SummitSchema,
});

export const ActivitySchema = z.object({
  id: z.string(),
  name: z.string(),
  userId: z.string(),
  startDate: z.coerce.date(),
  weather: z
    .string()
    .nullable()
    .optional()
    .transform((s) => (s ? JSON.parse(s) : null)),
  duration: z.number(),
  distance: z.number(),
  elevationGain: z.number(),
  elevationLoss: z.number(),
  maxSpeed: z.number(),
  minSpeed: z.number(),
  maxElevation: z.number(),
  minElevation: z.number(),
  maxHeartrate: z.number(),
  minHeartrate: z.number(),
  maxSlope: z.number(),
  points: z.array(PointSchema).optional(),
  images: z.array(ImageSchema).optional(),
  stravaActivityId: z.string().nullable().optional(),
  startLat: z.number().nullable(),
  startLng: z.number().nullable(),
  endLat: z.number().nullable(),
  endLng: z.number().nullable(),
  activitySummits: z.array(ActivitySummitSchema).optional(),
});

export type Activity = z.infer<typeof ActivitySchema>;

export const ActivityListSchema = z.array(ActivitySchema);

export const ActivityStatsSchema = z.object({
  totalDistance: z.coerce.number(),
  totalDuration: z.coerce.number(),
  totalElevationLoss: z.coerce.number(),
  count: z.number(),
});

export type ActivityStats = z.infer<typeof ActivityStatsSchema>;

const activityColumns = Object.keys(ActivitySchema.shape);

export const ActivityFiltersSchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  minDistance: z.coerce.string().optional(),
  maxDistance: z.coerce.string().optional(),
  minDuration: z.coerce.string().optional(),
  maxDuration: z.coerce.string().optional(),
  sortBy: z.enum(activityColumns).default("startDate").optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc").optional(),
  page: z.coerce.string().default("1").optional(),
  limit: z.coerce.string().default("100").optional(),
});

export type ActivityFilters = z.infer<typeof ActivityFiltersSchema>;

export const ActivityApiParamsSchema = ActivityFiltersSchema.transform((f) => ({
  ...f,
  minDistance: f.minDistance ? String(Number(f.minDistance) * 1000) : undefined,
  maxDistance: f.maxDistance ? String(Number(f.maxDistance) * 1000) : undefined,
}));

export const MapBoundsSchema = z.object({
  north: z.coerce.number(),
  south: z.coerce.number(),
  east: z.coerce.number(),
  west: z.coerce.number(),
});

export type MapBounds = z.infer<typeof MapBoundsSchema>;

export const MapPointsResponseSchema = z.record(
  z.string(),
  z.array(PointSchema),
);

export type MapPointsResponse = z.infer<typeof MapPointsResponseSchema>;
