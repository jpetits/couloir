import z from "zod";
import { getTableColumns } from "drizzle-orm";
import { activities } from "../db/schema";

const activityColumns = Object.keys(getTableColumns(activities));

export const activityFiltersSchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  minDistance: z.coerce.number().optional(),
  maxDistance: z.coerce.number().optional(),
  minDuration: z.coerce.number().optional(),
  maxDuration: z.coerce.number().optional(),
  sortBy: z.enum(activityColumns).default("date"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  limit: z.coerce
    .number()
    .gt(0, { message: "errors.amountRequired" })
    .default(100),
  page: z.coerce.number().gt(0).default(1),
});

export type ActivityFilters = z.infer<typeof activityFiltersSchema>;

export const patchActivitiesSchema = z.object({
  name: z.string().optional(),
});

export const callBackStravaSchema = z.object({
  code: z.string(),
});

export type CallBackStravaQuery = z.infer<typeof callBackStravaSchema>;
