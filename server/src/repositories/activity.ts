import { activities } from "../db/schema";
import { eq } from "drizzle-orm";
import { db } from "../db/index";

type Db = typeof db;

export const activityRepository = (db: Db) => ({
  list: async (limit: number) => {
    return db.select().from(activities).limit(limit);
  },
  findById: async (id: number) => {
    return db.select().from(activities).where(eq(activities.id, id.toString()));
  },
  create: async (data: any) => {
    return db.insert(activities).values(data).returning();
  },
  delete: async (id: number) => {
    return db.delete(activities).where(eq(activities.id, id.toString()));
  },
});
