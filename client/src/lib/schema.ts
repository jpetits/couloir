import { z } from "zod";

export const PointSchema = z.object({
  id: z.string(),
  activityId: z.string(),
  lat: z.number(),
  lng: z.number(),
  ele: z.number(),
  speed: z.number(),
  time: z.string(),
  dist: z.number(),
  cumDist: z.number(),
});

export type Point = z.infer<typeof PointSchema>;

export const ActivitySchema = z.object({
  id: z.string(),
  name: z.string(),
  userId: z.string(),
  date: z.string(),
  duration: z.number(),
  distance: z.number(),
  elevGain: z.number(),
  elevLoss: z.number(),
  maxSpeed: z.number(),
  maxSlope: z.number(),
  points: z.array(PointSchema).optional(),
});

export type Activity = z.infer<typeof ActivitySchema>;

export const ActivityListSchema = z.array(ActivitySchema);

export const ActivityStatsSchema = z.object({
  totalDistance: z.coerce.number(),
  totalDuration: z.coerce.number(),
  totalElevationLoss: z.coerce.number(),
  count: z.number(),
  activityList: z.array(ActivitySchema),
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
  sortBy: z.enum(activityColumns).default("date"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.string().default("1"),
  limit: z.coerce.string().default("10"),
});

export type ActivityFilters = z.infer<typeof ActivityFiltersSchema>;
