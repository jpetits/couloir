import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const activityRepository = (db) => ({
  list: async (limit: number) => {
    return db.select().from(users).limit(limit);
  },
  findById: async (id: number) => {
    return db.select().from(users).where(eq(users.id, id));
  },
  create: async (data: any) => {
    return db.insert(users).values(data).returning();
  },
});
