import express, { type Router } from "express";
import { requireAuth } from "@clerk/express";
import { attachUser } from "../middleware/attachUser";

const router: Router = express.Router();

router.get("/me", requireAuth(), attachUser, async (req, res) => {
  res.status(200).json({ stravaConnected: !!req.user.stravaAccessToken });
  res.status(200).json({
    stravaConnected: !!req.user.stravaAccessToken,
    username: req.user.username ?? null,
    isPublic: req.user.isPublic ?? false,
  });
});

export default router;
