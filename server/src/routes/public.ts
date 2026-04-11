import express, { type Router } from "express";
import { getPublicActivities, getPublicMap, getPublicStats } from "../controllers/public";
import { validateQuery } from "../middleware/validate";
import { mapBoundsSchema } from "../schema/query";

const router: Router = express.Router();

router.get("/:username/activities", getPublicActivities);
router.get("/:username/map", validateQuery(mapBoundsSchema), getPublicMap);
router.get("/:username/stats", getPublicStats);

export default router;
