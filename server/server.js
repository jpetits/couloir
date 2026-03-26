import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import errorHandler from "./src/middleware/error";
import notFoundHandler from "./src/middleware/notFound";
import activityRouter from "./src/routes/activities";
import { clerkMiddleware} from '@clerk/express'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));
app.use(clerkMiddleware());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/activities", activityRouter);

app.use(notFoundHandler);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
