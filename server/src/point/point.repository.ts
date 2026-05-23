import { Inject, Injectable } from "@nestjs/common";
import { eq, sql } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type * as schema from "../db/schema";
import { points } from "../db/schema";
import type { MapBounds } from "../schema/query";
import type { NewPoint } from "../types/types";

@Injectable()
export class PointRepository {
  constructor(
    @Inject("DB") private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  list(limit: number) {
    return this.db.select().from(points).limit(limit);
  }
  findById(id: number) {
    return this.db.select().from(points).where(eq(points.id, id.toString()));
  }
  create(data: NewPoint[]) {
    return this.db.insert(points).values(data).returning();
  }
  listPointsInBounds(userId: string, bounds: MapBounds) {
    return this.db.execute(sql`
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
  }
}
