import type { Request, Response } from "express";
import * as stravaService from "../services/strava";
import type {
  CallBackStravaQuery,
  GetStravaWebhookQuery,
  PostStravaWebhookBody,
} from "../schema/query";

export const callBackStrava = async (req: Request, res: Response) => {
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

export const syncStravaActivities = async (req: Request, res: Response) => {
  stravaService.syncStravaActivities(req.user);
  res.status(200).json({ message: "Strava activities synced successfully" });
};

export const getStravaWebhook = async (req: Request, res: Response) => {
  const { "hub.challenge": challenge, "hub.verify_token": verify_token } =
    req.validatedQuery as GetStravaWebhookQuery;

  if (verify_token !== process.env.STRAVA_WEBHOOK_VERIFY_TOKEN) {
    return res.status(403).json({ error: "Invalid verify token" });
  }

  if (challenge) {
    return res.status(200).json({ "hub.challenge": challenge });
  }

  res.status(400).json({ error: "Missing hub.challenge query parameter" });
};

export const postStravaWebhook = async (req: Request, res: Response) => {
  const { aspect_type, object_id, object_type, owner_id } =
    req.validatedBody as PostStravaWebhookBody;

  if (aspect_type === "create" && object_type === "activity") {
    try {
      await stravaService.handleStravaWebhook(
        String(object_id),
        String(owner_id),
      );
    } catch (error) {
      console.error("Error handling Strava webhook:", error);
      return res
        .status(500)
        .json({ error: "Failed to process Strava webhook" });
    }
  }

  res.status(200).json({ message: "Event received" });
};
