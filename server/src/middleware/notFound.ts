import type { Request, Response, NextFunction } from "express";
import { HttpError } from "../types/types";

const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error: HttpError = new Error("Not found");
  error.status = 404;
  next(error);
};

export default notFoundHandler;
