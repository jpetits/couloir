import express, { type Router } from "express";
import { syncStravaActivities, callBackStrava } from "../controllers/strava";
import { validateBody } from "../middleware/validate.js";
import { callBackStravaSchema } from "../schema/query";
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

export default router;
