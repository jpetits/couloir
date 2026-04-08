import express, { type Router } from "express";
import {
  syncStravaActivities,
  callBackStrava,
  getStravaWebhook,
  postStravaWebhook,
} from "../controllers/strava";
import { validateBody, validateQuery } from "../middleware/validate.js";
import {
  callBackStravaSchema,
  getStravaWebhookSchema,
  postStravaWebhookSchema,
} from "../schema/query";
import { requireAuth } from "@clerk/express";
import { attachUser } from "../middleware/attachUser";

const router: Router = express.Router();

router.post(
  "/callback",
  requireAuth(),
  attachUser,
  validateBody(callBackStravaSchema),
  callBackStrava,
);
router.post("/sync", requireAuth(), attachUser, syncStravaActivities);
router.get("/webhook", validateQuery(getStravaWebhookSchema), getStravaWebhook);
router.post(
  "/webhook",
  validateBody(postStravaWebhookSchema),
  postStravaWebhook,
);

export default router;
