import express, { type Router } from "express";
import multer from "multer";
import {
  getActivities,
  postActivity,
  deleteActivity,
  findActivity,
  getActivitiesStats,
  getActivitiesMap,
  patchActivity,
} from "../controllers/activity";
import { validateBody, validateQuery } from "../middleware/validate.js";
import {
  activityFiltersSchema,
  mapBoundsSchema,
  patchActivitiesSchema,
} from "../schema/query";
import { requireAuth } from "@clerk/express";
import { attachUser } from "../middleware/attachUser";

const router: Router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get(
  "/",
  requireAuth(),
  attachUser,
  validateQuery(activityFiltersSchema),
  getActivities,
);
router.get("/stats", requireAuth(), attachUser, getActivitiesStats);
router.get(
  "/map",
  requireAuth(),
  attachUser,
  validateQuery(mapBoundsSchema),
  getActivitiesMap,
);
router.get("/:id", requireAuth(), attachUser, findActivity);
router.patch(
  "/:id",
  requireAuth(),
  attachUser,
  validateBody(patchActivitiesSchema),
  patchActivity,
);
router.post(
  "/",
  requireAuth(),
  attachUser,
  upload.single("file"),
  postActivity,
);
router.delete("/:id", requireAuth(), attachUser, deleteActivity);

export default router;
