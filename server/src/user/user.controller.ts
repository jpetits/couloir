import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Req,
  UseGuards,
} from "@nestjs/common";
import type { Request } from "express";
import type { z } from "zod";
import { ClerkGuard } from "../auth/clerk.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import type { users } from "../db/schema";
import { ZodValidationPipe } from "../pipes/zod-validation.pipe";
import { patchUserSchema } from "../schema/query";
import { UserService } from "./user.service";

type User = typeof users.$inferSelect;

@Controller("user")
export class UserController {
  constructor(@Inject(UserService) private readonly userService: UserService) {}

  @Get("me")
  @UseGuards(ClerkGuard)
  getMe(@Req() req: Request) {
    return this.userService.getMe((req as any).user);
  }

  @Get(":username")
  getByUsername(@Param("username") username: string) {
    return this.userService.getByUsername(username);
  }

  @Patch()
  @UseGuards(ClerkGuard)
  patch(
    @Body(new ZodValidationPipe(patchUserSchema))
    body: z.infer<typeof patchUserSchema>,
    @CurrentUser() user: User,
  ) {
    return this.userService.patch(user.id, body.username, body.isPublic);
  }
}
