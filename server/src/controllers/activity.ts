import type { NextFunction, Request, RequestHandler, Response } from "express";
import { z } from "zod";
import asyncHandler from "../middleware/asyncHandler";
import type {
  ActivityFilters,
  deleteActivitiesSchema,
  MapBounds,
  patchActivitiesSchema,
} from "../schema/query";
import * as activityService from "../services/activity";
import { AppError } from "../types/appError";

//@route GET /activities
//@desc Get all activities
//@access Public
export const getActivities: RequestHandler = asyncHandler(
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
export const findActivity: RequestHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;

    const activity = await activityService.getActivity(id, req.user.id);
    res.status(200).json(activity);
  },
);

// @route POST /activities
// @desc Create a new activity
// @access Public
export const postActivity: RequestHandler = asyncHandler(
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
export const patchActivity: RequestHandler = asyncHandler(
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
export const deleteActivity: RequestHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { ids } = req.validatedBody as z.infer<typeof deleteActivitiesSchema>;

    await Promise.all(
      ids.map((id) => activityService.deleteActivity(id, req.user.id)),
    );
    res.status(200).json({ ids });
  },
);

// @route GET /activities/stats
// @desc Get activities stats (aggregate only)
// @access Public
export const getActivitiesStats: RequestHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const stats = await activityService.getActivitiesStats(req.user.id);
    res.status(200).json(stats);
  },
);

// @route GET /activities/map
// @desc Get all activities with points for map display
// @access Public
export const getActivitiesMap: RequestHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const activities = await activityService.getActivitiesWithPoints(
      req.user.id,
      req.validatedQuery as MapBounds,
    );
    res.status(200).json(activities);
  },
);
