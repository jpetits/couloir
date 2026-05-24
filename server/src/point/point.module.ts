import { Module } from "@nestjs/common";
import { DrizzleModule } from "../drizzle/drizzle.module";
import { PointController } from "./point.controller";
import { PointRepository } from "./point.repository";

@Module({
  controllers: [PointController],
  providers: [PointRepository],
  imports: [DrizzleModule],
})
export class PointModule {}
