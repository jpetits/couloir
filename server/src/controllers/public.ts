import type { Request, Response, NextFunction, RequestHandler } from "express";
import asyncHandler from "../middleware/asyncHandler";
import { AppError } from "../types/appError";
import { userRepository } from "../repositories/user";
import { activityRepository } from "../repositories/activity";
import * as activityService from "../services/activity";
import type { MapBounds } from "../schema/query";

async function resolveUser(username: string) {
  const user = await userRepository.findByUsername(username);
  if (!user) throw new AppError("User not found", 404);
  if (!user.isPublic) throw new AppError("User not found", 404);
  return user;
}

// @route GET /api/public/:userid/activities
// @desc List activities for a public profile (no bounds, no auth)
export const getPublicActivities: RequestHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const user = await resolveUser(req.params.username as string);
    const activities = await activityRepository.listByUserId(user.id);
    res.status(200).json(activities);
  },
);

// @route GET /api/public/:userid/map
// @desc Get points in bounds for a public profile map (no auth)
export const getPublicMap: RequestHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const user = await resolveUser(req.params.username as string);
    const activities = await activityService.getActivitiesWithPoints(
      user.id,
      req.validatedQuery as MapBounds,
    );
    res.status(200).json(activities);
  },
);

const IMMICH_URL = process.env.IMMICH_URL!;
const IMMICH_API_KEY = process.env.IMMICH_API_KEY!;

export const getAsset: RequestHandler = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const id = req.params.id;
    const { size } = req.validatedQuery as any;

    const upstream = await fetch(
      `${IMMICH_URL}/api/assets/${id}/thumbnail?size=${size}`,
      { headers: { "x-api-key": IMMICH_API_KEY } },
    );

    console.log(upstream.ok, upstream.status);

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
  },
);
