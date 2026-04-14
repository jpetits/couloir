import { db } from "../db/index";
import { activities, images } from "../db/schema";
import { activityRepository } from "../repositories/activity";

const IMMICH_URL = process.env.IMMICH_URL!;
const IMMICH_API_KEY = process.env.IMMICH_API_KEY!;

async function fetchImmichAssetsWithGps(takenAfter?: Date, takenBefore?: Date) {
  let page = 1;
  let hasMore = true;
  const results = [];

  while (hasMore) {
    const res = await fetch(`${IMMICH_URL}/api/search/metadata`, {
      method: "POST",
      headers: {
        "x-api-key": IMMICH_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        page,
        size: 100,
        withExif: true,
        ...(takenAfter && { takenAfter: takenAfter.toISOString() }),
        ...(takenBefore && { takenBefore: takenBefore.toISOString() }),
      }),
    });
    const data = await res.json();
    const items = data.assets?.items ?? [];
    results.push(...items);
    hasMore = items.length === 100;
    page++;
  }

  console.log(`Fetched ${results.length} assets`);
  const withGps = results.filter(
    (a) => a.exifInfo?.latitude && a.exifInfo?.longitude,
  );
  console.log(`${withGps.length} have GPS coordinates`);
  return withGps;
}

export async function syncImmichAssets(
  userId: string,
  activityList?: (typeof activities.$inferInsert)[],
) {
  let takenAfter: Date | undefined;
  let takenBefore: Date | undefined;

  if (activityList && activityList.length > 0) {
    const starts = activityList
      .map((a) => a.startDate)
      .filter((d): d is Date => d instanceof Date);
    const ends = activityList
      .filter((a) => a.startDate instanceof Date)
      .map((a) => new Date((a.startDate as Date).getTime() + (a.duration as number) * 1000));

    if (starts.length > 0) {
      takenAfter = new Date(Math.min(...starts.map((d) => d.getTime())));
      takenBefore = new Date(Math.max(...ends.map((d) => d.getTime())));
    }
  }

  const assets = await fetchImmichAssetsWithGps(takenAfter, takenBefore);

  const activityListToMatch =
    activityList ??
    (await activityRepository.list(userId, {
      limit: 10000,
    }));

  for (const asset of assets) {
    const lat = asset.exifInfo!.latitude!;
    const lng = asset.exifInfo!.longitude!;
    const date = asset.fileCreatedAt!;

    const imageDateCreated = new Date(date);

    const matchedActivities = activityListToMatch.filter((activity) => {
      if (!activity.startDate) return false;
      const activityDate = new Date(activity.startDate);

      return (
        imageDateCreated >= activityDate &&
        imageDateCreated.getTime() <=
          activityDate.getTime() + activity.duration * 1000 // within activity duration
      );
    });

    const activityId = matchedActivities[0]?.id;
    if (!activityId) continue;

    await db.insert(images).values({
      activityId,
      immichId: asset.id,
      takenAt: imageDateCreated,
      lat,
      lng,
    });

    console.log(`Matched asset ${asset.id} to activity ${activityId}`);
  }
}

const userId = process.argv[2];
if (!userId) {
  console.error("Usage: pnpm immich:sync <userId>");
  process.exit(1);
}

syncImmichAssets(userId)
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
