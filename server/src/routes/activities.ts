import express from "express";
import {
  getActivities,
  updateActivities,
  postActivities,
  deleteActivity,
  findActivity,
} from "../controllers/activityController.js";
import { validateQuery } from "../middleware/validate.js";
import { getActivitiesSchema } from "../schema/query";
import authMiddleware from "../middleware/auth";

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  validateQuery(getActivitiesSchema),
  getActivities,
);
router.get("/:id", authMiddleware, findActivity);
router.post("/", authMiddleware, postActivity);
router.put("/:id", authMiddleware, updateActivity);
router.delete("/:id", authMiddleware, deleteActivity);

export default router;
