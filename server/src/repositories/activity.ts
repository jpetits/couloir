import { activities } from "../db/schema";
import { eq } from "drizzle-orm";
import { db } from "../db/index";

type Db = typeof db;

export const activityRepository = (db: Db) => ({
  list: async (limit: number, userId: string) => {
    return db
      .select()
      .from(activities)
      .where(eq(activities.userId, userId))
      .limit(limit);
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
      .where(
        (activities, { eq }) =>
          eq(activities.id, id) && eq(activities.userId, userId),
      );
  },
});
