import type { User } from "@clerk/express";
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ClerkGuard } from "../auth/clerk.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import { ZodValidationPipe } from "../pipes/zod-validation.pipe";
import {
  activityFiltersSchema,
  deleteActivitiesSchema,
  patchActivitiesSchema,
  type ActivityFilters,
  type MapBounds,
} from "../schema/query";
import { ActivityService } from "./activity.service";

@Controller("activities")
@UseGuards(ClerkGuard)
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Get()
  getActivities(
    @CurrentUser() user: User,
    @Query(new ZodValidationPipe(activityFiltersSchema)) query: ActivityFilters,
  ) {
    return this.activityService.getActivities(user.id, query);
  }

  @Get("stats")
  getActivitiesStats(@CurrentUser() user: User) {
    return this.activityService.getActivitiesStats(user.id);
  }

  @Get("map")
  getActivitiesMap(
    @CurrentUser() user: User,
    @Query(new ZodValidationPipe(patchActivitiesSchema)) query: MapBounds,
  ) {
    const bounds = query;
    return this.activityService.getActivitiesWithPoints(user.id, bounds);
  }

  @Get("search")
  searchActivities(@CurrentUser() user: User, @Query("q") q: string) {
    return this.activityService.searchActivities(user.id, q);
  }

  @Get(":id")
  findActivity(@CurrentUser() user: User, @Param("id") id: string) {
    return this.activityService.getActivity(id, user.id);
  }

  @Post()
  @HttpCode(201)
  @UseInterceptors(FileInterceptor("file"))
  createActivity(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException("File is required");
    return this.activityService.postActivity(file.buffer, user.id);
  }

  @Patch(":id")
  patchActivity(
    @CurrentUser() user: User,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(patchActivitiesSchema)) body: { name: string },
  ) {
    return this.activityService.patchActivity(id, user.id, { name: body.name });
  }

  @Delete()
  deleteActivities(
    @CurrentUser() user: User,
    @Body(new ZodValidationPipe(deleteActivitiesSchema))
    body: { ids: string[] },
  ) {
    return Promise.all(
      body.ids.map((id) => this.activityService.deleteActivity(id, user.id)),
    );
  }
}
