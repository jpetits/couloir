import { activities, points } from "../db/schema";

export interface StravaActivity {
  id: number;
  name: string;
  start_date: string;
  duration: number;
  elapsed_time: number;
  distance: number;
  total_elevation_gain: number;
  max_speed: number;
  max_heartrate?: number;
  start_latlng?: [number, number];
  end_latlng?: [number, number];
}

interface StravaStreamData<T> {
  data: T[];
}

export interface StravaStream {
  latlng?: StravaStreamData<[number, number]>;
  altitude?: StravaStreamData<number>;
  velocity_smooth?: StravaStreamData<number>;
  time?: StravaStreamData<number>;
  distance?: StravaStreamData<number>;
  heartrate?: StravaStreamData<number>;
}

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
