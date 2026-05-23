import { Module } from "@nestjs/common";
import { DrizzleModule } from "../drizzle/drizzle.module";
import { UserController } from "./user.controller";
import { UserRepository } from "./user.repository";
import { UserService } from "./user.service";

@Module({
  imports: [DrizzleModule],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserRepository, UserService],
})
export class UserModule {}
