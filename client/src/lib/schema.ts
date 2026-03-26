import { use } from "react";
import { z } from "zod";

export const PointSchema = z.object({
  id: z.string(),
  activityId: z.string(),
  lat: z.number(),
  lng: z.number(),
  ele: z.number(),
  speed: z.number(),
  time: z.string(),
});

export type Point = z.infer<typeof PointSchema>;

export const ActivitySchema = z.object({
  id: z.string(),
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
