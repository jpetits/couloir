import type { User } from "@clerk/express";
import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ClerkGuard } from "../auth/clerk.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import { ZodValidationPipe } from "../pipes/zod-validation.pipe";
import {
  callBackStravaSchema,
  getStravaWebhookSchema,
  postStravaWebhookSchema,
  type CallBackStravaQuery,
  type GetStravaWebhookQuery,
  type PostStravaWebhookBody,
} from "../schema/query";
import { UserRepository } from "../user/user.repository";
import { StravaService } from "./strava.service";

@Controller("strava")
@UseGuards(ClerkGuard)
export class StravaController {
  constructor(
    private readonly stravaService: StravaService,
    private readonly userRepository: UserRepository,
  ) {}

  @UseGuards(ClerkGuard)
  @Post("/callback")
  async callBackStrava(
    @CurrentUser() user: User,
    @Body(new ZodValidationPipe(callBackStravaSchema))
    body: CallBackStravaQuery,
  ) {
    const { code } = body;

    if (!code) {
      throw new BadRequestException({ error: "Code is required" });
    }

    try {
      await this.stravaService.handleStravaCallback(code, user.id);
      return { message: "Strava account linked successfully" };
    } catch (error) {
      console.error("Error handling Strava callback:", error);
      throw new InternalServerErrorException({
        error: "Failed to link Strava account",
      });
    }
  }

  @UseGuards(ClerkGuard)
  @Post("/sync")
  async syncStravaActivities(@CurrentUser() user: User) {
    const dbUser = await this.userRepository.findById(user.id);
    if (!dbUser) {
      throw new NotFoundException({ error: "User not found" });
    }
    await this.stravaService.syncStravaActivities(dbUser);
    return { message: "Strava activities synced successfully" };
  }

  @Get("/webhook")
  async getStravaWebhook(
    @Query(new ZodValidationPipe(getStravaWebhookSchema))
    query: GetStravaWebhookQuery,
  ) {
    const { "hub.challenge": challenge, "hub.verify_token": verify_token } =
      query;

    if (verify_token !== process.env.STRAVA_WEBHOOK_VERIFY_TOKEN) {
      throw new ForbiddenException({ error: "Invalid verify token" });
    }

    if (challenge) {
      return { "hub.challenge": challenge };
    }

    throw new BadRequestException({
      error: "Missing hub.challenge query parameter",
    });
  }

  @Post("/webhook")
  async postStravaWebhook(
    @Body(new ZodValidationPipe(postStravaWebhookSchema))
    body: PostStravaWebhookBody,
  ) {
    const { aspect_type, object_id, object_type, owner_id } = body;

    if (aspect_type === "create" && object_type === "activity") {
      try {
        await this.stravaService.handleStravaWebhook(
          String(object_id),
          String(owner_id),
        );
      } catch (error) {
        throw new InternalServerErrorException({
          error: "Failed to process Strava webhook",
        });
      }
    }

    return { message: "Event received" };
  }
}
