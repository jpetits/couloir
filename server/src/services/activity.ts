import { db } from "../db/index";
import { activityRepository } from "../repositories/activity";
import { pointRepository } from "../repositories/point";
import { type NewPoint } from "../types/types";
import { AppError } from "../types/appError";
import { parseFitFile } from "./fitParser";

export const getActivities = async (limit: number) => {
  const activitiesList = await activityRepository(db).list(limit);
  return activitiesList;
};

export const getActivity = async (id: string) => {
  const activity = await activityRepository(db).findById(id);
  if (!activity) throw new AppError("Activity not found", 404);
  return activity;
};

export const deleteActivity = async (id: string) => {
  await activityRepository(db).delete(id);
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
