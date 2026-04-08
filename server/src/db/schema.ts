import {
  pgTable,
  uuid,
  text,
  real,
  date,
  numeric,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const activities = pgTable("activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().default("Activity"),
  stravaActivityId: numeric("strava_activity_id").unique(),
  userId: text("user_id").notNull(),
  date: date("date").notNull(),
  duration: real("duration").notNull(), // in seconds
  distance: real("distance").notNull(), // in meters
  elevGain: real("elev_gain").notNull(),
  elevLoss: real("elev_loss").notNull(),
  maxSpeed: real("max_speed").notNull(), // km/h
  maxSlope: real("max_slope").notNull(), // in degrees
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
  ele: real("ele").notNull(),
  speed: real("speed").notNull(), // km/h
  time: date("time").notNull(),
  dist: real("dist").notNull(), // distance from previous point in meters
  cumDist: real("cum_dist").notNull(), // cumulative distance from start in meters
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
  stravaAthleteId: numeric("athlete_id").unique(),
});

export const usersRelations = relations(users, ({ one }) => ({
  activities: one(activities, {
    fields: [users.id],
    references: [activities.userId],
  }),
}));
