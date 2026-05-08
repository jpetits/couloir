import { requireAuth } from "@clerk/express";
import express, { type Router } from "express";
import { attachUser } from "../middleware/attachUser";
import { validateBody } from "../middleware/validate";
import { userRepository } from "../repositories/user";
import { patchUserSchema } from "../schema/query";

const router: Router = express.Router();

router.get("/me", requireAuth(), attachUser, async (req, res) => {
  res.status(200).json({
    stravaConnected: !!req.user.stravaAccessToken,
    username: req.user.username ?? null,
    isPublic: req.user.isPublic ?? false,
  });
});

router.get("/:username", async (req, res) => {
  const username = req.params.username as string;
  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  const user = await userRepository.findByUsername(username);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.status(200).json({
    username: user.username,
    isPublic: user.isPublic,
  });
});

router.patch(
  "/",
  requireAuth(),
  attachUser,
  validateBody(patchUserSchema),
  async (req, res) => {
    const { username, isPublic } = req.body;

    const existingUser = await userRepository.findByUsername(username);
    if (existingUser && existingUser.id !== req.user.id) {
      return res.status(400).json({ error: "Username already taken" });
    }

    await userRepository.update(req.user.id, {
      username,
      isPublic,
    });

    res.status(200).json({ message: "User updated successfully" });
  },
);

export default router;
