import express, { type Router } from "express";
import multer from "multer";
import {
  getActivities,
  postActivity,
  deleteActivity,
  findActivity,
} from "../controllers/activity";
import { validateQuery } from "../middleware/validate.js";
import {
  getActivitiesSchema,
  getActivitySchema,
  deleteActivitySchema,
} from "../schema/query";
import authMiddleware from "../middleware/auth";

const router: Router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/", validateQuery(getActivitiesSchema), getActivities);
router.get("/:id", validateQuery(getActivitySchema), findActivity);
router.post("/", upload.single("file"), postActivity);
router.delete("/:id", validateQuery(deleteActivitySchema), deleteActivity);

export default router;
