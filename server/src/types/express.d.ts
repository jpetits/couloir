import type {} from "@clerk/express";

declare global {
  namespace Express {
    interface Request {
      userId: string;
      user?: JwtPayload | string;
      validatedQuery?: unknown;
    }
  }
}
