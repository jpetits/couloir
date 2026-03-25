import {
  pgTable,
  uuid,
  varchar,
  text,
  real,
  date,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const activities = pgTable("activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  duration: real("duration").notNull(), // in seconds
  distance: real("distance").notNull(), // in meters
  elevGain: real("elev_gain").notNull(),
  elevLoss: real("elev_loss").notNull(),
  maxSpeed: real("max_speed").notNull(), // km/h
  maxSlope: real("max_slope").notNull(), // in degrees
});

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
});
