import express, { type Router } from "express";
import multer from "multer";
import {
  getActivities,
  postActivity,
  deleteActivity,
  findActivity,
} from "../controllers/activity";
import { validateQuery } from "../middleware/validate.js";
import { getActivitiesSchema } from "../schema/query";
import { requireAuth } from "@clerk/express";

const router: Router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get(
  "/",
  requireAuth(),
  validateQuery(getActivitiesSchema),
  getActivities,
);
router.get("/:id", requireAuth(), findActivity);
router.post("/", requireAuth(), upload.single("file"), postActivity);
router.delete("/:id", requireAuth(), deleteActivity);

export default router;
