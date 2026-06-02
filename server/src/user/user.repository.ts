import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "../db/schema";
import { users } from "../db/schema";

@Injectable()
export class UserRepository {
  constructor(
    @Inject("DB") private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  async findOrCreate(id: string) {
    const existing = await this.db.query.users.findFirst({
      where: eq(users.id, id),
    });
    if (existing) return existing;
    const [created] = await this.db.insert(users).values({ id }).returning();
    return created!;
  }

  findById(id: string) {
    return this.db.query.users.findFirst({
      where: eq(users.id, id),
    });
  }

  async update(id: string, data: Partial<typeof users.$inferInsert>) {
    const [result] = await this.db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return result;
  }

  findByUsername(username: string) {
    return this.db.query.users.findFirst({
      where: eq(users.username, username),
    });
  }

  findByStravaAthleteId(athleteId: string) {
    return this.db.query.users.findFirst({
      where: eq(users.stravaAthleteId, athleteId),
    });
  }
}
