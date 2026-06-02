import { MapBoundsSchema } from "@couloir/types";
import { getTableColumns } from "drizzle-orm";
import z from "zod";
import { activities } from "../db/schema";

const activityColumns = Object.keys(getTableColumns(activities));

export const activityFiltersSchema = z.object({
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  minDistance: z.coerce.number().optional(),
  maxDistance: z.coerce.number().optional(),
  minDuration: z.coerce.number().optional(),
  maxDuration: z.coerce.number().optional(),
  minElevationGain: z.coerce.number().optional(),
  maxElevationLoss: z.coerce.number().optional(),
  minElevationLoss: z.coerce.number().optional(),
  maxSpeed: z.coerce.number().optional(),
  minSpeed: z.coerce.number().optional(),
  sortBy: z.enum(activityColumns).default("startDate").optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc").optional(),
  limit: z.coerce.number().gt(0).default(100).optional(),
  page: z.coerce.number().gt(0).default(1).optional(),
  name: z.coerce.string().min(3).max(100).optional(),
});

export type ActivityFilters = z.infer<typeof activityFiltersSchema>;

export const searchActivitiesSchema = z.object({
  q: z.string().min(1),
});

export const deleteActivitiesSchema = z.object({
  ids: z.array(z.string()).min(1),
});

export const patchActivitiesSchema = z.object({
  name: z.string().min(3).max(100),
});

export const callBackStravaSchema = z.object({
  code: z.string(),
});

export const getStravaWebhookSchema = z.object({
  "hub.mode": z.string(),
  "hub.challenge": z.string(),
  "hub.verify_token": z.string(),
});

export const postStravaWebhookSchema = z.object({
  aspect_type: z.string(),
  event_time: z.coerce.number(),
  object_id: z.coerce.number(),
  object_type: z.string(),
  owner_id: z.coerce.number(),
  subscription_id: z.coerce.number(),
});

export type CallBackStravaQuery = z.infer<typeof callBackStravaSchema>;
export type GetStravaWebhookQuery = z.infer<typeof getStravaWebhookSchema>;
export type PostStravaWebhookBody = z.infer<typeof postStravaWebhookSchema>;

export const mapBoundsSchema = MapBoundsSchema.extend({
  excludeActivityIds: z.string().optional(), // comma-separated list of activity IDs to exclude
  zoom: z.coerce.number().optional(),
});

export type MapBounds = z.infer<typeof mapBoundsSchema>;

export const assetsSchema = z.object({
  size: z.enum(["thumbnail", "medium", "full"]).default("thumbnail").optional(),
});
