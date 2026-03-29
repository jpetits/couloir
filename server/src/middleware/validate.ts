import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

export const validateQuery =
  <T extends z.ZodTypeAny>(schema: T) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);

    if (!result.success) return next(result.error);
    req.validatedQuery = result.data as z.infer<T>;
    next();
  };

export const validateBody =
  <T extends z.ZodTypeAny>(schema: T) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) return next(result.error);
    req.validatedBody = result.data as z.infer<T>;
    next();
  };
