import { requireAuth } from "@clerk/express";
import express, { type Router } from "express";
import multer from "multer";
import {
  deleteActivity,
  findActivity,
  getActivities,
  getActivitiesMap,
  getActivitiesStats,
  patchActivity,
  postActivity,
} from "../controllers/activity";
import { attachUser } from "../middleware/attachUser";
import { validateBody, validateQuery } from "../middleware/validate.js";
import {
  activityFiltersSchema,
  deleteActivitiesSchema,
  mapBoundsSchema,
  patchActivitiesSchema,
} from "../schema/query";

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
router.delete(
  "/",
  requireAuth(),
  attachUser,
  validateBody(deleteActivitiesSchema),
  deleteActivity,
);

export default router;
