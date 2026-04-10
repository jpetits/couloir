import {
  pgTable,
  uuid,
  text,
  real,
  date,
  numeric,
  timestamp,
} from "drizzle-orm/pg-core";
import { max, min, relations } from "drizzle-orm";

export const activities = pgTable("activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().default("Activity"),
  stravaActivityId: numeric("strava_activity_id").unique(),
  userId: text("user_id").notNull(),
  date: date("date").notNull(),
  duration: real("duration").notNull(), // in seconds
  distance: real("distance").notNull(), // in meters
  elevationGain: real("elevation_gain").notNull(),
  elevationLoss: real("elevation_loss").notNull(),
  maxSpeed: real("max_speed").notNull(), // km/h
  minSpeed: real("min_speed").notNull(), // km/h
  maxElevation: real("max_elevation").notNull(), // in meters
  minElevation: real("min_elevation").notNull(), // in meters
  maxHeartrate: real("max_heartrate").notNull(), // in bpm
  minHeartrate: real("min_heartrate").notNull(), // in bpm
  maxSlope: real("max_slope").notNull(), // in degrees
  startLat: real("start_lat").notNull(),
  startLng: real("start_lng").notNull(),
});

export const activitiesRelations = relations(activities, ({ many }) => ({
  points: many(points),
}));

export const points = pgTable("points", {
  id: uuid("id").primaryKey().defaultRandom(),
  activityId: uuid("activity_id")
    .notNull()
    .references(() => activities.id, { onDelete: "cascade" }),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  elevation: real("elevation").notNull(),
  speed: real("speed").notNull(), // km/h
  time: date("time").notNull(),
  distance: real("distance").notNull(), // distance from previous point in meters
  cumDistance: real("cum_distance").notNull(), // cumulative distance from start in meters
  heartrate: real("heartrate").notNull(), // in bpm
});

export const pointsRelations = relations(points, ({ one }) => ({
  activity: one(activities, {
    fields: [points.activityId],
    references: [activities.id],
  }),
}));

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  stravaAccessToken: text("strava_access_token"),
  stravaRefreshToken: text("strava_refresh_token"),
  stravaTokenExpiresAt: timestamp("strava_token_expires_at"),
  stravaAthleteId: numeric("strava_athlete_id").unique(),
});

export const usersRelations = relations(users, ({ one }) => ({
  activities: one(activities, {
    fields: [users.id],
    references: [activities.userId],
  }),
}));
