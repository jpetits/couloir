import { points } from "../db/schema";
import { eq } from "drizzle-orm";
import { db } from "../db/index";

type Db = typeof db;

export const pointRepository = (db: Db) => ({
  list: async (limit: number) => {
    return db.select().from(points).limit(limit);
  },
  findById: async (id: number) => {
    return db.select().from(points).where(eq(points.id, id.toString()));
  },
  create: async (data: any) => {
    return db.insert(points).values(data).returning();
  },
});
