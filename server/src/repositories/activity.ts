import { activities } from "../db/schema";
import { eq, sum, count, lte, gte, and, desc, asc } from "drizzle-orm";
import { db } from "../db/index";
import type { ActivityFilters } from "../schema/query";
import type { NewActivity } from "../types/types";

type Db = typeof db;
type Activity = Omit<NewActivity, "id" | "userId">;

export const activityRepository = (db: Db) => ({
  list: async (userId: string, filters: ActivityFilters) => {
    const conditions = [eq(activities.userId, userId)];

    if (filters.dateFrom) {
      conditions.push(gte(activities.date, filters.dateFrom));
    }
    if (filters.dateTo) {
      conditions.push(lte(activities.date, filters.dateTo));
    }
    if (filters.minDistance) {
      conditions.push(gte(activities.distance, filters.minDistance));
    }
    if (filters.maxDistance) {
      conditions.push(lte(activities.distance, filters.maxDistance));
    }
    if (filters.minDuration) {
      conditions.push(gte(activities.duration, filters.minDuration));
    }
    if (filters.maxDuration) {
      conditions.push(lte(activities.duration, filters.maxDuration));
    }

    const sortColumn =
      filters?.sortBy === "distance" ? activities.distance : activities.date;

    const sortOrder = filters?.sortOrder === "asc" ? asc : desc;

    return db
      .select()
      .from(activities)
      .where(and(...conditions))
      .orderBy(sortOrder(sortColumn))
      .offset((filters.page - 1) * filters.limit)
      .limit(filters.limit);
  },
  findById: async (id: string) => {
    return db.query.activities.findFirst({
      where: (activities, { eq }) => eq(activities.id, id),
      with: { points: true },
    });
  },
  create: async (data: any) => {
    return db.insert(activities).values(data).returning();
  },
  delete: async (id: string) => {
    return db.delete(activities).where(eq(activities.id, id));
  },
  update: async (id: string, userId: string, fields: { name?: string }) => {
    const result = await db
      .update(activities)
      .set(fields)
      .where(and(eq(activities.id, id), eq(activities.userId, userId)))
      .returning();

    return result[0];
  },
  getStats: async (userId: string) => {
    const [statsResult, activityList] = await Promise.all([
      db
        .select({
          totalDistance: sum(activities.distance),
          totalDuration: sum(activities.duration),
          totalElevationLoss: sum(activities.elevLoss),
          count: count(),
        })
        .from(activities)
        .where(eq(activities.userId, userId)),
      db.query.activities.findMany({
        where: (activities, { eq }) => eq(activities.userId, userId),
        with: { points: true },
      }),
    ]);

    return {
      ...(statsResult[0] || {
        totalDistance: 0,
        totalDuration: 0,
        totalElevationLoss: 0,
        count: 0,
      }),
      activityList,
    };
  },
});
