import { getAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";

export const attachUser = (req: Request, res: Response, next: NextFunction) => {
  req.userId = getAuth(req).userId!;
  next();
};
