import express, { type Router } from "express";
import multer from "multer";
import {
  getActivities,
  postActivity,
  deleteActivity,
  findActivity,
  getActivitiesStats,
  patchActivity,
} from "../controllers/activity";
import { validateQuery } from "../middleware/validate.js";
import { getActivitiesSchema, patchActivitiesSchema } from "../schema/query";
import { requireAuth } from "@clerk/express";
import { attachUser } from "../middleware/attachUser";

const router: Router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get(
  "/",
  requireAuth(),
  attachUser,
  validateQuery(getActivitiesSchema),
  getActivities,
);
router.get("/stats", requireAuth(), attachUser, getActivitiesStats);
router.get("/:id", requireAuth(), attachUser, findActivity);
router.patch(
  "/:id",
  requireAuth(),
  attachUser,
  validateQuery(patchActivitiesSchema),
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
