import { Module } from "@nestjs/common";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../db/schema";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { schema });

@Module({
  providers: [{ provide: "DB", useValue: db }],
  exports: ["DB"],
})
export class DrizzleModule {}
