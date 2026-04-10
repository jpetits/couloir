import { activities, points } from "../db/schema";

export interface FitRecord {
  position_lat?: number;
  position_long?: number;
  altitude?: number;
  enhanced_speed?: number;
  timestamp?: string;
  enhanced_altitude?: number;
  heart_rate?: number;
}

export interface HttpError extends Error {
  status?: number;
}

export type NewPoint = typeof points.$inferInsert;
export type NewActivity = typeof activities.$inferInsert;

export type ParsedActivity = Omit<NewActivity, "id" | "userId"> & {
  points: ParsedPoint[];
};
export type ParsedPoint = Omit<NewPoint, "id" | "activityId">;
