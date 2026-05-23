import { Controller, Get, Param, Query, Res } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Response } from "express";
import { ActivityRepository } from "../activity/activity.repository";
import { ActivityService } from "../activity/activity.service";
import type { users } from "../db/schema";
import { UserPublicResolvePipe } from "../pipes/user-resolve.pipe";
import { ZodValidationPipe } from "../pipes/zod-validation.pipe";
import type { MapBounds } from "../schema/query";
import { assetsSchema, mapBoundsSchema } from "../schema/query";
type User = typeof users.$inferSelect;

@Controller("public")
export class PublicController {
  private readonly immichUrl: string;
  private readonly immichApiKey: string;
  constructor(
    private readonly activityRepository: ActivityRepository,
    private readonly activityService: ActivityService,
    private readonly configService: ConfigService,
  ) {
    this.immichUrl = this.configService.getOrThrow("IMMICH_URL");
    this.immichApiKey = this.configService.getOrThrow("IMMICH_API_KEY");
  }

  @Get("/:username/activities")
  getPublicActivities(@Param("username", UserPublicResolvePipe) user: User) {
    return this.activityRepository.listByUserId(user.id);
  }

  @Get("/:username/map")
  getPublicMap(
    @Param("username", UserPublicResolvePipe) user: User,
    @Query(new ZodValidationPipe(mapBoundsSchema)) query: MapBounds,
  ) {
    return this.activityService.getActivitiesWithPoints(user.id, query);
  }

  @Get("/assets/:id/thumbnail")
  async getAsset(
    @Param("id") id: string,
    @Query(new ZodValidationPipe(assetsSchema)) query: { size: string },
    @Res() res: Response,
  ) {
    const upstream = await fetch(
      `${this.immichUrl}/api/assets/${id}/thumbnail?size=${query.size}`,
      { headers: { "x-api-key": this.immichApiKey } },
    );

    if (!upstream.ok) {
      res.status(upstream.status).end();
      return;
    }

    res.setHeader(
      "Content-Type",
      upstream.headers.get("content-type") ?? "image/jpeg",
    );
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

    const buffer = await upstream.arrayBuffer();
    res.end(Buffer.from(buffer));
  }
}
