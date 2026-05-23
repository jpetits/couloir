import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ActivityModule } from "./activity/activity.module";
import { DrizzleModule } from "./drizzle/drizzle.module";
import { PointModule } from "./point/point.module";
import { PublicModule } from "./public/public.module";
import { StravaModule } from "./strava/strava.module";
import { UserModule } from "./user/user.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DrizzleModule,
    ActivityModule,
    StravaModule,
    UserModule,
    PointModule,
    PublicModule,
  ],
})
export class AppModule {}
