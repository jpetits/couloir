import { Module } from "@nestjs/common";
import { UserModule } from "../user/user.module";
import { ClerkGuard } from "./clerk.guard";

@Module({
  imports: [UserModule],
  providers: [ClerkGuard],
  exports: [ClerkGuard, UserModule],
})
export class AuthModule {}
