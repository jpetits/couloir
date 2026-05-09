import "dotenv/config";
import { db } from "../db/index";
import { activities } from "../db/schema";
import { updateActivityEmbedding } from "../services/embedding";
import { processQueue } from "../services/queue";

const all = await db.select({ id: activities.id }).from(activities);

processQueue(
  all,
  async (item) => {
    await updateActivityEmbedding(item.id);
    console.log(`embedded ${item.id}`);
  },
  1500,
);

process.exit(0);
