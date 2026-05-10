import {
  and,
  asc,
  count,
  desc,
  eq,
  getTableColumns,
  gt,
  gte,
  isNotNull,
  lte,
  SQL,
  sum,
} from "drizzle-orm";
import { db } from "../db/index";
import { activities } from "../db/schema";
import type { ActivityFilters } from "../schema/query";

const filtersList = {
  dateFrom: (date: Date) => gte(activities.startDate, date),
  dateTo: (date: Date) => lte(activities.startDate, date),
  minDistance: (distance: number) => gte(activities.distance, distance),
  maxDistance: (distance: number) => lte(activities.distance, distance),
  minDuration: (duration: number) => gte(activities.duration, duration),
  maxDuration: (duration: number) => lte(activities.duration, duration),
  maxSpeed: (speed: number) => lte(activities.maxSpeed, speed),
};

export const activityRepository = {
  list: async (userId: string, filters: ActivityFilters) => {
    const conditions = [eq(activities.userId, userId)];

    for (const key in filtersList) {
      const filter = filters[key as keyof ActivityFilters];
      if (filter !== undefined) {
        conditions.push(
          filtersList[key as keyof typeof filtersList]!(filter as never),
        );
      }
    }

    const orderFns = { asc, desc } as const;
    const orderFn = orderFns[filters.sortOrder ?? "desc"];

    const columns = getTableColumns(activities);
    const orderCol =
      columns[(filters.sortBy ?? "startDate") as keyof typeof columns];

    const limit = filters.limit ?? 100;
    const page = filters.page ?? 1;
    return db
      .select()
      .from(activities)
      .where(and(...conditions))
      .orderBy(orderFn(orderCol))
      .offset((page - 1) * limit)
      .limit(limit);
  },
  findById: async (id: string) => {
    return db.query.activities.findFirst({
      where: (activities, { eq }) => eq(activities.id, id),
      with: {
        points: true,
        images: true,
        activitySummits: { with: { summit: true } },
      },
    });
  },
  create: async (data: typeof activities.$inferInsert) => {
    return db.insert(activities).values(data).returning();
  },
  delete: async (id: string) => {
    return db.delete(activities).where(eq(activities.id, id));
  },
  update(id: string, activity: Partial<typeof activities.$inferInsert>) {
    return db
      .update(activities)
      .set(activity)
      .where(eq(activities.id, id))
      .returning();
  },
  updateByUserId: async (
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
      with: {
        points: true,
        images: true,
        activitySummits: { with: { summit: true } },
      },
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
    return db.query.activities.findMany({
      where: (activities, { eq }) => eq(activities.userId, userId),
      with: { images: true, activitySummits: { with: { summit: true } } },
      orderBy: (activities, { desc }) => [desc(activities.startDate)],
    });
  },
  createMany: async (activitiesData: (typeof activities.$inferInsert)[]) => {
    if (activitiesData.length === 0) return [];

    return db.insert(activities).values(activitiesData).returning();
  },
  search: async (
    userId: string,
    query: string,
    similarityScore: SQL<unknown>,
  ) => {
    const { embedding, ...rest } = getTableColumns(activities);
    return db
      .select({
        ...rest,
        similarityScore,
      })
      .from(activities)
      .where(
        and(
          eq(activities.userId, userId),
          isNotNull(activities.embedding),
          gt(similarityScore, 0.3),
        ),
      )
      .orderBy(asc(similarityScore))
      .limit(100);
  },
  searchByFilters: async (
    userId: string,
    filters: Partial<ActivityFilters>,
  ) => {
    const conditions = [eq(activities.userId, userId)];
    for (const key in filtersList) {
      const filter = filters[key as keyof ActivityFilters];
      if (filter !== undefined) {
        conditions.push(
          filtersList[key as keyof typeof filtersList]!(filter as never),
        );
      }
    }
    const { embedding, ...rest } = getTableColumns(activities);
    return db
      .select({ ...rest })
      .from(activities)
      .where(and(...conditions))
      .orderBy(desc(activities.startDate))
      .limit(200);
  },
};
