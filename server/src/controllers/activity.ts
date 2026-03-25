import type { Request, Response, NextFunction, RequestHandler } from "express";
import * as activityService from "../services/activity";
import asyncHandler from "../middleware/asyncHandler";
import { AppError } from "../types/appError";
import type { getActivitiesSchema } from "../schema/query";
import { z } from "zod";

//@route GET /activities
//@desc Get all activities
//@access Public
const getActivities: RequestHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const activitiesList = await activityService.getActivities(
      (req.validatedQuery as z.infer<typeof getActivitiesSchema>).limit,
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
    const activity = await activityService.getActivity(id);
    res.status(200).json(activity);
  },
);

// @route POST /activity
// @desc Create a new activity
// @access Public
const postActivity: RequestHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const file = req.file;

    if (!file) {
      const error = new AppError("File is required", 400);
      return next(error);
    }

    const activity = await activityService.postActivity(file.buffer);

    res.status(201).json(activity);
  },
);

// @route DELETE /activity/:id
// @desc Delete an activity by id
// @access Public
const deleteActivity: RequestHandler = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;
    await activityService.deleteActivity(id);
    res.status(204).send();
  },
);

export { getActivities, findActivity, postActivity, deleteActivity };
