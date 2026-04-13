import {
  pgTable,
  uuid,
  text,
  real,
  date,
  numeric,
  timestamp,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const activities = pgTable(
  "activities",
  {
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
    startLat: real("start_lat"),
    startLng: real("start_lng"),
    endLat: real("end_lat"),
    endLng: real("end_lng"),
  },
  (table) => [
    index("activities_user_id_idx").on(table.userId),
    index("activities_strava_activity_id_idx").on(table.stravaActivityId),
  ],
);

export const activitiesRelations = relations(activities, ({ many }) => ({
  points: many(points),
}));

export const points = pgTable(
  "points",
  {
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
  },
  (table) => [
    index("points_lat_lng_idx").on(table.lat, table.lng),
    index("points_activity_id_idx").on(table.activityId),
  ],
);

export const pointsRelations = relations(points, ({ one }) => ({
  activity: one(activities, {
    fields: [points.activityId],
    references: [activities.id],
  }),
}));

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  username: text("username").unique(),
  isPublic: boolean("is_public").default(false),
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

export const images = pgTable("images", {
  id: uuid("id").primaryKey().defaultRandom(),
  activityId: uuid("activity_id")
    .notNull()
    .references(() => activities.id, { onDelete: "cascade" }),
  url: text("url").notNull(), // Rock5B URL
  lat: real("lat").notNull(), // from EXIF
  lng: real("lng").notNull(), // from EXIF
  takenAt: date("taken_at").notNull(), // from EXIF
});

export const imagesRelations = relations(images, ({ one }) => ({
  activity: one(activities, {
    fields: [images.activityId],
    references: [activities.id],
  }),
}));
