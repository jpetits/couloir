import { ActivityFiltersSchema } from "@couloir/types";

export {
  ActivityFiltersSchema,
  ActivityListSchema,
  ActivitySchema,
  ActivityStatsSchema,
  ActivitySummitSchema,
  ImageSchema,
  MapBoundsSchema,
  MapPointsResponseSchema,
  PointSchema,
  SummitSchema,
  UserSchema,
} from "@couloir/types";

export type {
  Activity,
  ActivityFilters,
  ActivityStats,
  ActivitySummit,
  Image,
  MapBounds,
  MapPointsResponse,
  Point,
  Summit,
  User,
} from "@couloir/types";

export const ActivityApiParamsSchema = ActivityFiltersSchema.transform((f) => ({
  ...f,
  minDistance: f.minDistance ? String(Number(f.minDistance) * 1000) : undefined,
  maxDistance: f.maxDistance ? String(Number(f.maxDistance) * 1000) : undefined,
}));
