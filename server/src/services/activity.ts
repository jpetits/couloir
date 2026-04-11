import { activityRepository } from "../repositories/activity";
import { pointRepository } from "../repositories/point";
import type { NewPoint, ParsedPoint } from "../types/types";
import { AppError } from "../types/appError";
import { parseFitFile } from "./fitParser";
import type { ActivityFilters, MapBounds } from "../schema/query";
import { simplifyByMaxDistance } from "./stravaParser";

export const getActivities = async (
  userId: string,
  filters: ActivityFilters,
) => {
  return await activityRepository.list(userId, filters);
};

export const getActivitiesStats = async (userId: string) => {
  return await activityRepository.getStats(userId);
};

export const getActivitiesWithPoints = async (
  userId: string,
  bounds: MapBounds,
) => {
  const zoom = bounds.zoom || 0;
  const pointList = (
    await pointRepository.listPointsInBounds(userId, bounds)
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

  if (!zoom) {
    return pointList;
  }

  const maxDistance = zoom < 11 ? 0.5 : zoom < 15 ? 0.05 : 0.01;

  const grouped = Object.groupBy(pointList, (p) => p.activityId);

  for (const activityId in grouped) {
    grouped[activityId] = simplifyByMaxDistance(
      grouped[activityId]!,
      maxDistance,
    );
  }
  return grouped;
};

export const getActivity = async (id: string, userId: string) => {
  const activity = await activityRepository.findById(id);
  if (!activity) throw new AppError("Activity not found", 404);
  if (userId !== activity.userId) throw new AppError("Unauthorized", 401);
  return activity;
};

export const deleteActivity = async (id: string, userId: string) => {
  const activity = await activityRepository.findById(id);
  if (!activity) throw new AppError("Activity not found", 404);
  if (userId !== activity.userId) throw new AppError("Unauthorized", 401);
  await activityRepository.delete(id);
};

export const patchActivity = async (
  id: string,
  userId: string,
  fields: { name?: string },
) => {
  const activity = await activityRepository.update(id, userId, fields);
  if (!activity) throw new AppError("Activity not found", 404);
  return activity;
};

export const postActivity = async (buffer: Buffer, userId: string) => {
  const { points: parsedPoints, ...activityFields } =
    await parseFitFile(buffer);

  const [activity] = await activityRepository.create({
    ...activityFields,
    userId,
  });

  if (!activity) throw new AppError("Failed to create activity", 500);

  const newPoints: NewPoint[] = parsedPoints.map((p: ParsedPoint) => ({
    ...p,
    activityId: activity.id,
  }));

  await pointRepository.create(newPoints);

  return activity;
};
