import type { Request, Response, NextFunction, RequestHandler } from "express";
import * as activityService from "../services/activity";
import asyncHandler from "../middleware/asyncHandler";
import { AppError } from "../types/appError";
import type {
  getActivitiesSchema,
  patchActivitiesSchema,
} from "../schema/query";
import { z } from "zod";

//@route GET /activities
//@desc Get all activities
//@access Public
const getActivities: RequestHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { limit, page } = req.validatedQuery as z.infer<
      typeof getActivitiesSchema
    >;
    const activitiesList = await activityService.getActivities(
      limit,
      page,
      req.userId,
    );
    return res.status(200).json(activitiesList);
  },
);

// @route GET /activities/:id
// @desc Get an activity by id
// @access Public
const findActivity: RequestHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;

    const activity = await activityService.getActivity(id, req.userId);
    res.status(200).json(activity);
  },
);

// @route POST /activities
// @desc Create a new activity
// @access Public
const postActivity: RequestHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const file = req.file;

    if (!file) {
      const error = new AppError("File is required", 400);
      return next(error);
    }

    const activity = await activityService.postActivity(
      file.buffer,
      req.userId,
    );

    res.status(201).json(activity);
  },
);

// @route PATCH /activities/:id
// @desc Update an activity by id
// @access Public
const patchActivity: RequestHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;
    const { name } = req.validatedBody as z.infer<typeof patchActivitiesSchema>;

    const activity = await activityService.patchActivity(id, req.userId, {
      name: name as string,
    });

    res.status(200).json(activity);
  },
);

// @route DELETE /activities/:id
// @desc Delete an activity by id
// @access Public
const deleteActivity: RequestHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;

    await activityService.deleteActivity(id, req.userId);
    res.status(200).json({ id });
  },
);

// @route GET /activities/stats
// @desc Get activities stats
// @access Public
const getActivitiesStats: RequestHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const stats = await activityService.getActivitiesStats(req.userId);

    res.status(200).json(stats);
  },
);

export {
  getActivities,
  findActivity,
  postActivity,
  patchActivity,
  deleteActivity,
  getActivitiesStats,
};
