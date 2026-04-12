import express, { type Router } from "express";
import { getPublicActivities, getPublicMap } from "../controllers/public";
import { validateQuery } from "../middleware/validate";
import { mapBoundsSchema } from "../schema/query";

const router: Router = express.Router();

router.get("/:username/activities", getPublicActivities);
router.get("/:username/map", validateQuery(mapBoundsSchema), getPublicMap);

export default router;
