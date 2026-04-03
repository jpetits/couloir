import z from "zod";

export const activityFiltersSchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  minDistance: z.coerce.number().optional(),
  maxDistance: z.coerce.number().optional(),
  minDuration: z.coerce.number().optional(),
  maxDuration: z.coerce.number().optional(),
  sortBy: z.enum(["date", "distance", "duration"]).default("date"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  limit: z.coerce
    .number()
    .gt(0, { message: "errors.amountRequired" })
    .default(10),
  page: z.coerce.number().gt(0).default(1),
});

export type ActivityFilters = z.infer<typeof activityFiltersSchema>;

export const patchActivitiesSchema = z.object({
  name: z.string().optional(),
});
