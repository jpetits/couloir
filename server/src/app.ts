import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import errorHandler from "./middleware/error";
import notFoundHandler from "./middleware/notFound";
import activityRouter from "./routes/activities";
import publicRouter from "./routes/public";
import stravaRouter from "./routes/strava";
import userRouter from "./routes/user";

const app: Express = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));
app.use(clerkMiddleware());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/activities", activityRouter);
app.use("/api/strava", stravaRouter);
app.use("/api/public", publicRouter);
app.use("/api/user", userRouter);
app.use("/health", (req, res) => res.status(200).json({ status: "ok" }));

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
