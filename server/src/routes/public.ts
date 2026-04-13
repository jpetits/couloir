import express, { type Router } from "express";
import {
  getPublicActivities,
  getPublicMap,
  getAsset,
} from "../controllers/public";
import { validateQuery } from "../middleware/validate";
import { mapBoundsSchema, assetsSchema } from "../schema/query";

const router: Router = express.Router();

router.get("/:username/activities", getPublicActivities);
router.get("/:username/map", validateQuery(mapBoundsSchema), getPublicMap);
router.get("/assets/:id/thumbnail", validateQuery(assetsSchema), getAsset);

export default router;
