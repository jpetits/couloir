import { points } from "../db/schema";
import { eq } from "drizzle-orm";
import { db } from "../db/index";
import type { NewPoint } from "../types/types";

export const pointRepository = {
  list: async (limit: number) => {
    return db.select().from(points).limit(limit);
  },
  findById: async (id: number) => {
    return db.select().from(points).where(eq(points.id, id.toString()));
  },
  create: async (data: NewPoint[]) => {
    return db.insert(points).values(data).returning();
  },
};
