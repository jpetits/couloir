import { Module } from "@nestjs/common";
import { ActivityModule } from "../activity/activity.module";
import { DrizzleModule } from "../drizzle/drizzle.module";
import { UserPublicResolvePipe } from "../pipes/user-resolve.pipe";
import { UserModule } from "../user/user.module";
import { PublicController } from "./public.controller";

@Module({
  controllers: [PublicController],
  providers: [UserPublicResolvePipe],
  imports: [DrizzleModule, ActivityModule, UserModule],
})
export class PublicModule {}
