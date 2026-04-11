import { points } from "../db/schema";
import { between, eq, getTableColumns, notInArray, sql } from "drizzle-orm";
import { db } from "../db/index";
import type { NewPoint } from "../types/types";
import { activities } from "../db/schema";
import { and } from "drizzle-orm";
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
      JOIN activities a ON p.activity_id = a.id
      WHERE a.user_id = ${userId}
      AND p.lat BETWEEN ${bounds.south} AND ${bounds.north}
      AND p.lng BETWEEN ${bounds.west} AND ${bounds.east}
      
    `);
    // return await db
    //   .select(getTableColumns(points))
    //   .from(points)
    //   .innerJoin(activities, eq(points.activityId, activities.id))
    //   .where(
    //     and(
    //       eq(activities.userId, userId),
    //       notInArray(
    //         points.activityId,
    //         bounds.excludeActivityIds?.split(",").filter(Boolean) ?? [],
    //       ),
    //       between(points.lat, bounds.south, bounds.north),
    //       between(points.lng, bounds.west, bounds.east),
    //     ),
    //   );
  },
};
