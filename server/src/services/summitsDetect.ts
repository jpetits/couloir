import { distance, point } from "@turf/turf";

import { db } from "../db";
import { activities, points, summits, users } from "../db/schema";

const PROXIMITY_KM = 0.2; // 200m threshold to consider a summit reached

interface OsmPeak {
  id: number;
  lat: number;
  lon: number;
  tags: { name?: string; ele?: string };
}

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const OVERPASS_TIMEOUT_MS = 10_000;

async function fetchOsmPeaks(
  pointList: (typeof points.$inferSelect)[],
): Promise<OsmPeak[]> {
  const lats = pointList.map((p) => p.lat);
  const lngs = pointList.map((p) => p.lng);
  const north = Math.max(...lats);
  const south = Math.min(...lats);
  const east = Math.max(...lngs);
  const west = Math.min(...lngs);

  const query = `[out:json][timeout:10];node[natural=peak](${south},${west},${north},${east});out body;`;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(`${endpoint}?data=${encodeURIComponent(query)}`, {
        signal: AbortSignal.timeout(OVERPASS_TIMEOUT_MS),
      });

      console.log(`${endpoint}?data=${encodeURIComponent(query)}`);

      if (!res.ok) {
        console.warn(`Overpass endpoint ${endpoint} error: ${res.status}`);
        await new Promise((r) => setTimeout(r, 10000));
        continue;
      }

      const data = await res.json();
      return (data.elements ?? []) as OsmPeak[];
    } catch (err) {
      console.warn(
        `Overpass endpoint ${endpoint} failed:`,
        (err as Error).message,
      );
      await new Promise((r) => setTimeout(r, 10000));
    }
  }

  console.error("All Overpass endpoints failed, skipping summit detection");
  return [];
}

export async function summitsDetect(
  _user: typeof users.$inferSelect,
  activity: typeof activities.$inferSelect | undefined,
  pointList: (typeof points.$inferSelect)[],
) {
  if (!activity || pointList.length < 3) return;

  const osmPeaks = await fetchOsmPeaks(pointList);
  if (osmPeaks.length === 0) return;

  const summitList: (typeof summits.$inferInsert)[] = [];

  for (const peak of osmPeaks) {
    const peakPoint = point([peak.lon, peak.lat]);
    const reached = pointList.some(
      (p) =>
        distance(point([p.lng, p.lat]), peakPoint, { units: "kilometers" }) <=
        PROXIMITY_KM,
    );

    if (reached) {
      summitList.push({
        activityId: activity.id,
        lat: peak.lat,
        lng: peak.lon,
        elevation: peak.tags.ele ? parseFloat(peak.tags.ele) : 0,
        osmId: String(peak.id),
        name: peak.tags.name ?? null,
      });
    }
  }

  if (summitList.length === 0) return;

  await db.insert(summits).values(summitList);

  console.log(
    `Detected ${summitList.length} summits for activity ${activity.id}`,
  );
}
