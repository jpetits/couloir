import { points } from "../db/schema";
import { eq, sql } from "drizzle-orm";
import { db } from "../db/index";
import type { NewPoint } from "../types/types";
import type { MapBounds } from "../schema/query";

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
  listPointsInBounds: async (userId: string, bounds: MapBounds) => {
    return db.execute(sql`
      SELECT p.*
      FROM points p
      WHERE p.activity_id IN (
        SELECT DISTINCT p2.activity_id
        FROM points p2
        JOIN activities a ON p2.activity_id = a.id
        WHERE a.user_id = ${userId}
        AND p2.lat BETWEEN ${bounds.south} AND ${bounds.north}
        AND p2.lng BETWEEN ${bounds.west} AND ${bounds.east}
      )
    `);
  },
};
