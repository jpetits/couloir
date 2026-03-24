import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { AppError } from "../types/appError";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) throw new AppError("Token manquant", 401, "MISSING_TOKEN");

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET as string);
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new AppError("Token expiré", 401, "TOKEN_EXPIRED");
    }
    throw new AppError("Token invalide", 401, "INVALID_TOKEN");
  }
};

export default authMiddleware;
