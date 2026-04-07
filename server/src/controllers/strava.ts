import type { Request, Response } from "express";
import * as stravaService from "../services/strava";
import type { CallBackStravaQuery } from "../schema/query";

const callBackStrava = async (req: Request, res: Response) => {
  const { code } = req.validatedBody as CallBackStravaQuery;

  if (!code) {
    return res.status(400).json({ error: "Code is required" });
  }

  try {
    await stravaService.handleStravaCallback(code, req.user.id);
    res.status(200).json({ message: "Strava account linked successfully" });
  } catch (error) {
    console.error("Error handling Strava callback:", error);
    res.status(500).json({ error: "Failed to link Strava account" });
  }
};

const syncStravaActivities = async (req: Request, res: Response) => {
  stravaService.syncStravaActivities(req.user);
  res.status(200).json({ message: "Strava activities synced successfully" });
};

export { callBackStrava, syncStravaActivities };
