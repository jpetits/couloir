import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
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
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  duration: integer("duration").notNull(), // in seconds
  distance: integer("distance").notNull(), // in meters
  elevGain: integer("elev_gain").notNull(), // in meters
  elevLoss: integer("elev_loss").notNull(), // in meters
  maxSpeed: integer("max_speed").notNull(), // in m/s
  maxSlope: integer("max_slope").notNull(), // in degrees
  points: text("points").notNull(), // JSON stringified array of points
});

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  activityId: uuid("activity_id")
    .notNull()
    .references(() => activities.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
