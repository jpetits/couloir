import type {} from "@clerk/express";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload | string;
      validatedQuery?: unknown;
    }
  }
}
