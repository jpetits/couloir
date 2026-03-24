import type { Request, Response, NextFunction } from "express";
import { HttpError } from "../types/types";

const errorHandler = (
  err: HttpError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err.name === "ZodError") {
    return res.status(400).json({
      code: "VALIDATION_ERROR",
    });
  }

  if (err.status) {
    return res.status(err.status).json({ msg: "Error: " + err.message });
  }
  res.status(500).json({ msg: "Error: " + err.message });
};

export default errorHandler;
