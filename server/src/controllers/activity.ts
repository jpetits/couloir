import type { Request, Response, NextFunction, RequestHandler } from "express";
import * as activityService from "../services/activity";
import asyncHandler from "../middleware/asyncHandler";
import { AppError } from "../types/appError";
import type {
  ActivityFilters,
  MapBounds,
  patchActivitiesSchema,
} from "../schema/query";
import { z } from "zod";

//@route GET /activities
//@desc Get all activities
//@access Public
const getActivities: RequestHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const activitiesList = await activityService.getActivities(
      req.user.id,
      req.validatedQuery as ActivityFilters,
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

    const activity = await activityService.getActivity(id, req.user.id);
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
      req.user.id,
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

    const activity = await activityService.patchActivity(id, req.user.id, {
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

    await activityService.deleteActivity(id, req.user.id);
    res.status(200).json({ id });
  },
);

// @route GET /activities/stats
// @desc Get activities stats (aggregate only)
// @access Public
const getActivitiesStats: RequestHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const stats = await activityService.getActivitiesStats(req.user.id);
    res.status(200).json(stats);
  },
);

// @route GET /activities/map
// @desc Get all activities with points for map display
// @access Public
const getActivitiesMap: RequestHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const activities = await activityService.getActivitiesWithPoints(
      req.user.id,
      req.validatedQuery as MapBounds,
    );
    res.status(200).json(activities);
  },
);

export {
  getActivities,
  findActivity,
  postActivity,
  patchActivity,
  deleteActivity,
  getActivitiesStats,
  getActivitiesMap,
};
