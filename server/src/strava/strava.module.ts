import { Module } from "@nestjs/common";
import { ActivityRepository } from "../activity/activity.repository";
import { ActivityService } from "../activity/activity.service";
import { EmbeddingService } from "../activity/embedding.service";
import { DrizzleModule } from "../drizzle/drizzle.module";
import { PointRepository } from "../point/point.repository";
import { UserRepository } from "../user/user.repository";
import { FitParserService } from "./fitParser.service";
import { ImmichService } from "./immich.service";
import { QueueService } from "./queue.service";
import { StravaController } from "./strava.controller";
import { StravaService } from "./strava.service";
import { StravaParserService } from "./stravaParser.service";
import { WeatherService } from "./weather.service";
import { WebsocketGateway } from "./websocket.gateway";

@Module({
  controllers: [StravaController],
  providers: [
    StravaService,
    QueueService,
    ImmichService,
    StravaParserService,
    WeatherService,
    ActivityService,
    UserRepository,
    PointRepository,
    ActivityRepository,
    EmbeddingService,
    WebsocketGateway,
    FitParserService,
  ],
  imports: [DrizzleModule],
})
export class StravaModule {}
