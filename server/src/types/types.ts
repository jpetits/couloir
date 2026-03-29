import { activities, points } from "../db/schema";

export interface FitRecord {
  position_lat?: number;
  position_long?: number;
  altitude?: number;
  speed?: number;
  timestamp?: string;
  enhanced_altitude?: number;
}

export interface HttpError extends Error {
  status?: number;
}

export type NewPoint = typeof points.$inferInsert;
export type NewActivity = typeof activities.$inferInsert;
