import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { PointRepository } from "../point/point.repository";
import type { ActivityFilters, MapBounds } from "../schema/query";
import { FitParserService } from "../strava/fitParser.service";
import { StravaParserService } from "../strava/stravaParser.service";
import type { NewPoint } from "../types/types";
import { ActivityRepository } from "./activity.repository";
import { EmbeddingService } from "./embedding.service";

@Injectable()
export class ActivityService {
  constructor(
    private readonly activityRepository: ActivityRepository,
    private readonly pointRepository: PointRepository,
    private readonly embeddingService: EmbeddingService,
    private readonly stravaParserService: StravaParserService,
    private readonly fitParserService: FitParserService,
  ) {}

  getActivities(userId: string, filters: ActivityFilters) {
    return this.activityRepository.list(userId, filters);
  }

  getActivitiesStats(userId: string) {
    return this.activityRepository.getStats(userId);
  }

  async getActivity(id: string, userId: string) {
    const activity = await this.activityRepository.findById(id);
    if (!activity) throw new NotFoundException("Activity not found");
    if (activity.userId !== userId) throw new UnauthorizedException();
    return activity;
  }

  async deleteActivity(id: string, userId: string) {
    const activity = await this.activityRepository.findById(id);
    if (!activity) throw new NotFoundException("Activity not found");
    if (userId !== activity.userId) throw new UnauthorizedException();
    await this.activityRepository.delete(id);
  }

  async patchActivity(id: string, userId: string, fields: { name?: string }) {
    const activity = await this.activityRepository.updateByUserId(
      id,
      userId,
      fields,
    );
    if (!activity) throw new NotFoundException("Activity not found");
    return activity;
  }

  async postActivity(buffer: Buffer, userId: string) {
    const { points: parsedPoints, ...activityFields } =
      await this.fitParserService.parseFitFile(buffer);
    const [activity] = await this.activityRepository.create({
      ...activityFields,
      userId,
    });
    if (!activity)
      throw new InternalServerErrorException("Failed to create activity");
    const newPoints: NewPoint[] = parsedPoints.map((p) => ({
      ...p,
      activityId: activity.id,
    }));
    await this.pointRepository.create(newPoints);
    return activity;
  }

  async getActivitiesWithPoints(userId: string, bounds: MapBounds) {
    const zoom = bounds.zoom || 0;
    const pointList = (
      await this.pointRepository.listPointsInBounds(userId, bounds)
    ).map((p: any) => ({
      id: p.id,
      activityId: p.activity_id,
      lat: p.lat,
      lng: p.lng,
      elevation: p.elevation,
      speed: p.speed,
      time: p.time,
      distance: p.distance,
      cumDistance: p.cum_distance,
      heartrate: p.heartrate,
    }));

    if (!zoom) return pointList;

    const maxDistance = zoom < 11 ? 0.5 : zoom < 15 ? 0.05 : 0.01;
    const grouped = Object.groupBy(pointList, (p) => p.activityId);
    for (const activityId in grouped) {
      grouped[activityId] = this.stravaParserService.simplifyByMaxDistance(
        grouped[activityId]!,
        maxDistance,
      );
    }
    return grouped;
  }

  async searchActivities(userId: string, query: string): Promise<any[]> {
    try {
      return await this.embeddingService.searchActivitiesEmbeddings(
        userId,
        query,
      );
    } catch {
      throw new InternalServerErrorException(
        "An error occurred while searching",
      );
    }
  }
}
