import express, { type Router } from "express";
import { requireAuth } from "@clerk/express";
import { attachUser } from "../middleware/attachUser";
import { userRepository } from "../repositories/user";
import { z } from "zod";

const router: Router = express.Router();

router.get("/me", requireAuth(), attachUser, async (req, res) => {
  res.status(200).json({
    stravaConnected: !!req.user.stravaAccessToken,
    username: req.user.username ?? null,
    isPublic: req.user.isPublic ?? false,
  });
});

router.patch(
  "/me",
  requireAuth(),
  attachUser,
  async (req, res, next) => {
    try {
      const fields = z.object({
        username: z.string().min(2).max(32).regex(/^[a-z0-9_]+$/).optional(),
        isPublic: z.boolean().optional(),
      }).parse(req.body);
      const updated = await userRepository.update(req.user.id, fields);
      res.status(200).json({ username: updated?.username ?? null, isPublic: updated?.isPublic ?? false });
    } catch (err: any) {
      if (err?.code === "23505") {
        res.status(409).json({ message: "Username already taken" });
        return;
      }
      next(err);
    }
  },
);

export default router;
