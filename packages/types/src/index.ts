import { z } from "zod";

export const ImageSchema = z.object({
  id: z.string(),
  activityId: z.string(),
  immichId: z.string(),
  lat: z.number(),
  lng: z.number(),
});
export type Image = z.infer<typeof ImageSchema>;

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
export type Summit = z.infer<typeof SummitSchema>;

export const ActivitySummitSchema = z.object({
  activityId: z.string(),
  summitId: z.string(),
  summit: SummitSchema,
});
export type ActivitySummit = z.infer<typeof ActivitySummitSchema>;

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
  simmilarityScore: z.number().optional(),
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
  maxSpeed: z.coerce.string().optional(),
  sortBy: z.enum(activityColumns).default("startDate").optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc").optional(),
  page: z.coerce.string().default("1").optional(),
  limit: z.coerce.string().default("100").optional(),
  q: z.string().optional(),
});
export type ActivityFilters = z.infer<typeof ActivityFiltersSchema>;

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

export const AddressSchema = z.object({
  formatted: z.string(),
  street: z.string(),
  city: z.string(),
  postalCode: z.string(),
  country: z.string(),
  lat: z.number(),
  lng: z.number(),
});
export type Address = z.infer<typeof AddressSchema>;

export const Sports = ["hiking", "running", "cycling", "swimming"] as const;
export const SportsSchema = z.enum(Sports);
export type Sports = z.infer<typeof SportsSchema>;

export const Units = ["km", "miles"] as const;
export const UnitsSchema = z.enum(Units);
export type Units = z.infer<typeof UnitsSchema>;

export const UserSchema = z.object({
  id: z.string(),
  username: z.string().min(2).max(30),
  isPublic: z.boolean(),
  stravaConnected: z.boolean(),
  bio: z.string().optional(),
  units: UnitsSchema.default("km").optional(),
  sports: z.array(SportsSchema).default(["running"]).optional(),
  weeklyDistance: z.coerce.number().default(0),
  birthDate: z.coerce
    .date()
    .min(new Date("1920-01-01"))
    .max(new Date(), "Cannot be in the future")
    .optional(),
  website: z.url().optional(),
  address: AddressSchema.optional().default({} as Address),
});

export type User = z.infer<typeof UserSchema>;

export const PatchUserSchema = UserSchema.omit({
  id: true,
  stravaConnected: true,
}).partial();

export type PatchUser = z.infer<typeof PatchUserSchema>;

export const FrontPatchUserSchema = z.object({
  username: z.string().min(2).max(30),
  isPublic: z.boolean(),
  bio: z.string().min(10).max(2000).optional(),
  units: UnitsSchema.default("km").optional(),
  sports: z.array(SportsSchema).default(["running"]).optional(),
  weeklyDistance: z.number().min(0).default(0),
  birthDate: z
    .date()
    .min(new Date("1920-01-01"))
    .max(new Date(), "Cannot be in the future")
    .optional(),
  website: z
    .string()
    .transform((s) => {
      if (!s) return s;
      return s.startsWith("http") ? s : `https://${s}`;
    })
    .pipe(z.union([z.url({ hostname: z.regexes.domain }), z.literal("")]))
    .optional(),
  address: AddressSchema.optional().default({} as Address),
});
