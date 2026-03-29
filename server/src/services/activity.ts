import { db } from "../db/index";
import { activityRepository } from "../repositories/activity";
import { pointRepository } from "../repositories/point";
import { type NewPoint } from "../types/types";
import { AppError } from "../types/appError";
import { parseFitFile } from "./fitParser";

export const getActivities = async (
  limit: number,
  page: number,
  userId: string,
) => {
  const activitiesList = await activityRepository(db).list(limit, page, userId);
  return activitiesList;
};

export const getActivitiesStats = async (userId: string) => {
  return await activityRepository(db).getStats(userId);
};

export const getActivity = async (id: string, userId: string) => {
  const activity = await activityRepository(db).findById(id, userId);
  if (!activity) throw new AppError("Activity not found", 404);
  return activity;
};

export const deleteActivity = async (id: string, userId: string) => {
  await activityRepository(db).delete(id, userId);
};

export const patchActivity = async (
  id: string,
  userId: string,
  fields: { name?: string },
) => {
  const activity = await activityRepository(db).update(id, userId, fields);
  if (!activity) throw new AppError("Activity not found", 404);
  return activity;
};

export const postActivity = async (buffer: Buffer, userId: string) => {
  const { points: parsedPoints, ...activityFields } =
    await parseFitFile(buffer);

  const [activity] = await activityRepository(db).create({
    ...activityFields,
    userId,
  });

  if (!activity) throw new AppError("Failed to create activity", 500);

  const newPoints: NewPoint[] = parsedPoints.map((p) => ({
    ...p,
    activityId: activity.id,
  }));

  await pointRepository(db).create(newPoints);

  return activity;
};
