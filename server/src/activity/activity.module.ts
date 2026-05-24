import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { DrizzleModule } from "../drizzle/drizzle.module";
import { PointRepository } from "../point/point.repository";
import { FitParserService } from "../strava/fitParser.service";
import { StravaParserService } from "../strava/stravaParser.service";
import { ActivityController } from "./activity.controller";
import { ActivityRepository } from "./activity.repository";
import { ActivityService } from "./activity.service";
import { EmbeddingService } from "./embedding.service";

@Module({
  controllers: [ActivityController],
  providers: [
    ActivityService,
    ActivityRepository,
    PointRepository,
    StravaParserService,
    EmbeddingService,
    FitParserService,
  ],
  exports: [ActivityRepository, ActivityService],
  imports: [DrizzleModule, AuthModule],
})
export class ActivityModule {}
