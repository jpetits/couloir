import { activities } from "../db/schema";
import { eq, sum, count } from "drizzle-orm";
import { db } from "../db/index";

type Db = typeof db;

export const activityRepository = (db: Db) => ({
  list: async (limit: number, page: number, userId: string) => {
    return db
      .select()
      .from(activities)
      .where(eq(activities.userId, userId))
      .limit(limit)
      .offset((page - 1) * limit);
  },
  findById: async (id: string, userId: string) => {
    return db.query.activities.findFirst({
      where: (activities, { eq }) =>
        eq(activities.id, id) && eq(activities.userId, userId),
      with: { points: true },
    });
  },
  create: async (data: any) => {
    return db.insert(activities).values(data).returning();
  },
  delete: async (id: string, userId: string) => {
    return db
      .delete(activities)
      .where(eq(activities.id, id) && eq(activities.userId, userId));
  },
  update: async (id: string, userId: string, fields: { name?: string }) => {
    const result = await db
      .update(activities)
      .set(fields)
      .where(eq(activities.id, id) && eq(activities.userId, userId))
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
