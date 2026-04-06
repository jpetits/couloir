import { getAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";
import { userRepository } from "../repositories/user";

export const attachUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const clerkUserId = getAuth(req).userId!;
  req.user = await userRepository.findOrCreate(clerkUserId);
  next();
};
