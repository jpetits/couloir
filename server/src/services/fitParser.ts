import FitParser from "fit-file-parser";
import { lineString, point, distance, simplify } from "@turf/turf";
import turfLength from "@turf/length";
import {
  type FitRecord,
  type NewActivity,
  type NewPoint,
} from "../types/types";

type ParsedActivity = Omit<NewActivity, "id" | "userId"> & {
  points: ParsedPoint[];
};

type ParsedPoint = Omit<NewPoint, "id" | "activityId">;

const fitParser = new FitParser({
  force: true,
  speedUnit: "km/h",
  lengthUnit: "km",
  temperatureUnit: "celsius",
  elapsedRecordField: true,
});

const getStatsFromPoints = (points: ParsedPoint[]) => {
  // Distance totale avec Turf
  const line = lineString(points.map((p) => [p.lng, p.lat]));
  const totalDistance = turfLength(line, { units: "meters" });

  // Dénivelé + pente max
  let elevGain = 0;
  let elevLoss = 0;
  let maxSlope = 0;

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    if (!prev || !curr) continue;
    const diff = curr.ele - prev.ele;
    if (diff > 0) elevGain += diff;
    else elevLoss += Math.abs(diff);

    // Pente avec Turf pour la distance
    const from = point([prev.lng, prev.lat]);
    const to = point([curr.lng, curr.lat]);
    const segDist = distance(from, to, { units: "meters" });

    if (segDist > 0) {
      const slope = Math.atan(Math.abs(diff) / segDist) * (180 / Math.PI);
      if (slope > maxSlope) maxSlope = slope;
    }
  }

  return { totalDistance, elevGain, elevLoss, maxSlope };
};

const getPointsFromRecords = (records: FitRecord[]) => {
  const filtered = records.filter((r) => r.position_lat && r.position_long);

  const line = lineString(
    filtered.map((r) => [r.position_long as number, r.position_lat as number]),
  );
  const simplified = simplify(line, { tolerance: 0.0001, highQuality: false });
  const simplifiedCoords = new Set(
    simplified.geometry.coordinates.map(([lng, lat]) => `${lng},${lat}`),
  );

  return filtered
    .filter((r) => simplifiedCoords.has(`${r.position_long},${r.position_lat}`))
    .map((r, i, arr) => {
      const prev = arr[i - 1];
      return {
        lat: r.position_lat as number,
        lng: r.position_long as number,
        ele: r.enhanced_altitude ?? 0,
        speed: r.speed ?? 0,
        time: r.timestamp ? new Date(r.timestamp).toISOString() : "",
        dist: prev
          ? distance(
              point([
                prev.position_long as number,
                prev.position_lat as number,
              ]),
              point([r.position_long as number, r.position_lat as number]),
              { units: "meters" },
            )
          : 0,
      };
    });
};

export const parseFitFile = (fileBuffer: Buffer): Promise<ParsedActivity> => {
  return new Promise((resolve, reject) => {
    fitParser.parse(fileBuffer as Buffer<ArrayBuffer>, (error, data) => {
      if (error) return reject(error);

      const records = data?.records ?? [];

      const points: ParsedPoint[] = getPointsFromRecords(records);

      if (!points || points.length === 0)
        return reject(new Error("No GPS data found"));

      const { totalDistance, elevGain, elevLoss, maxSlope } =
        getStatsFromPoints(points);

      const session = data?.sessions?.[0];
      const firstPoint = points[0];
      const name = data?.activity?.event ?? "Activity";

      resolve({
        date: firstPoint?.time
          ? new Date(firstPoint.time).toISOString()
          : new Date().toISOString(),
        duration: session?.total_timer_time ?? 0,
        distance: totalDistance,
        elevGain: session?.total_ascent ?? elevGain,
        elevLoss: session?.total_descent ?? elevLoss,
        maxSpeed: session?.max_speed ?? Math.max(...points.map((p) => p.speed)),
        maxSlope,
        points,
        name: name,
      });
    });
  });
};
