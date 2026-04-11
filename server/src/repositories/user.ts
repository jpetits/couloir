import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

export const userRepository = {
  findOrCreate: async (id: string) => {
    const existing = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, id),
    });
    if (existing) return existing;
    const [created] = await db.insert(users).values({ id }).returning();
    return created;
  },
  findById: async (id: string) => {
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, id),
    });
    return user || null;
  },
  update: async (id: string, user: Partial<typeof users.$inferInsert>) => {
    const result = await db
      .update(users)
      .set(user)
      .where(eq(users.id, id))
      .returning();

    return result[0];
  },
  findByUsername: async (username: string) => {
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.username, username),
    });
    return user || null;
  },
  findByStravaAthleteId: async (athleteId: string) => {
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.stravaAthleteId, athleteId),
    });
    return user || null;
  },
};
