import { activities } from "../db/schema";
import {
  eq,
  sum,
  count,
  lte,
  gte,
  and,
  desc,
  asc,
  getTableColumns,
} from "drizzle-orm";
import { db } from "../db/index";
import type { ActivityFilters } from "../schema/query";

export const activityRepository = {
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

    const orderFns = { asc, desc } as const;
    const orderFn = orderFns[filters.sortOrder];

    const columns = getTableColumns(activities);
    const orderCol = columns[filters.sortBy as keyof typeof columns];

    return db
      .select()
      .from(activities)
      .where(and(...conditions))
      .orderBy(orderFn(orderCol))
      .offset((filters.page - 1) * filters.limit)
      .limit(filters.limit);
  },
  findById: async (id: string) => {
    return db.query.activities.findFirst({
      where: (activities, { eq }) => eq(activities.id, id),
      with: { points: true },
    });
  },
  create: async (data: typeof activities.$inferInsert) => {
    return db.insert(activities).values(data).returning();
  },
  delete: async (id: string) => {
    return db.delete(activities).where(eq(activities.id, id));
  },
  update: async (
    id: string,
    userId: string,
    activity: Partial<typeof activities.$inferInsert>,
  ) => {
    const result = await db
      .update(activities)
      .set(activity)
      .where(and(eq(activities.id, id), eq(activities.userId, userId)))
      .returning();

    return result[0];
  },
  getStats: async (userId: string) => {
    const result = await db
      .select({
        totalDistance: sum(activities.distance),
        totalDuration: sum(activities.duration),
        totalElevationLoss: sum(activities.elevationLoss),
        count: count(),
      })
      .from(activities)
      .where(eq(activities.userId, userId));

    return (
      result[0] || {
        totalDistance: 0,
        totalDuration: 0,
        totalElevationLoss: 0,
        count: 0,
      }
    );
  },
  listWithPoints: async (userId: string) => {
    return db.query.activities.findMany({
      where: (activities, { eq }) => eq(activities.userId, userId),
      with: { points: true },
    });
  },
  findByStravaId: async (stravaActivityId: string, userId: string) => {
    return db.query.activities.findFirst({
      where: (activities, { eq }) =>
        and(
          eq(activities.stravaActivityId, stravaActivityId),
          eq(activities.userId, userId),
        ),
    });
  },
  findStravaIdsByUser: async (userId: string) => {
    return db.query.activities.findMany({
      where: (activities, { eq }) => eq(activities.userId, userId),
      columns: { stravaActivityId: true },
    });
  },
  listByUserId: async (userId: string) => {
    return db
      .select()
      .from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(desc(activities.date));
  },
  createMany: async (activitiesData: (typeof activities.$inferInsert)[]) => {
    if (activitiesData.length === 0) return [];

    return db.insert(activities).values(activitiesData).returning();
  },
};
