import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import { clerkMiddleware } from "@clerk/express";
import activityRouter from "./routes/activities";
import stravaRouter from "./routes/strava";
import userRouter from "./routes/user";
import publicRouter from "./routes/public";
import errorHandler from "./middleware/error";
import notFoundHandler from "./middleware/notFound";

const app: Express = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));
app.use(clerkMiddleware());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/activities", activityRouter);
app.use("/api/strava", stravaRouter);
app.use("/api/user", userRouter);
app.use("/api/public", publicRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
