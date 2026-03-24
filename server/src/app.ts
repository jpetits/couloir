import express, { type Application } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import errorHandler from "./middleware/error";
import notFoundHandler from "./middleware/notFound";
import activityRouter from "./routes/activities";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/activities", activityRouter);

app.use(notFoundHandler);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
