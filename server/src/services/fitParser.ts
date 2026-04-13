import FitParser from "fit-file-parser";
import { lineString, point, distance } from "@turf/turf";
import turfLength from "@turf/length";
import type { FitRecord, ParsedPoint, ParsedActivity } from "../types/types";
import { simplifyByMaxDistance } from "./stravaParser";

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
  let elevationGain = 0;
  let elevationLoss = 0;
  let maxSlope = 0;

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    if (!prev || !curr) continue;
    const diff = curr.elevation - prev.elevation;
    if (diff > 0) elevationGain += diff;
    else elevationLoss += Math.abs(diff);

    // Pente avec Turf pour la distance
    const from = point([prev.lng, prev.lat]);
    const to = point([curr.lng, curr.lat]);
    const segDist = distance(from, to, { units: "meters" });

    if (segDist > 0) {
      const slope = Math.atan(Math.abs(diff) / segDist) * (180 / Math.PI);
      if (slope > maxSlope) maxSlope = slope;
    }
  }

  return { totalDistance, elevationGain, elevationLoss, maxSlope };
};

const getPointsFromRecords = (records: FitRecord[]) => {
  const filtered = records.filter((r) => r.position_lat && r.position_long);

  let cumDist = 0;

  return simplifyByMaxDistance(
    filtered.map((r) => ({
      ...r,
      lat: r.position_lat as number,
      lng: r.position_long as number,
    })),
  ).map((r, i, arr) => {
    const prev = arr[i - 1];
    const dist = prev
      ? distance(point([prev.lng, prev.lat]), point([r.lng, r.lat]), {
          units: "meters",
        })
      : 0;
    cumDist += dist;
    return {
      lat: r.lat,
      lng: r.lng,
      elevation: r.enhanced_altitude ?? 0,
      speed: r.enhanced_speed ?? 0,
      time: r.timestamp ? new Date(r.timestamp).toISOString() : "",
      distance: dist,
      cumDistance: cumDist,
      heartrate: r.heart_rate ?? 0,
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

      const { totalDistance, elevationGain, elevationLoss, maxSlope } =
        getStatsFromPoints(points);

      const session = data?.sessions?.[0];
      const firstPoint = points[0];
      const name = data?.activity?.event ?? "Activity";

      resolve({
        startLat: firstPoint?.lat ?? 0,
        startLng: firstPoint?.lng ?? 0,
        endLat: points[points.length - 1]?.lat ?? 0,
        endLng: points[points.length - 1]?.lng ?? 0,
        date: firstPoint?.time
          ? new Date(firstPoint.time).toISOString()
          : new Date().toISOString(),
        duration: session?.total_timer_time ?? 0,
        distance: totalDistance,
        elevationGain: session?.total_ascent ?? elevationGain,
        elevationLoss: session?.total_descent ?? elevationLoss,
        maxSpeed: session?.max_speed ?? Math.max(...points.map((p) => p.speed)),
        minSpeed: session?.max_speed ?? Math.min(...points.map((p) => p.speed)),
        maxElevation:
          session?.max_altitude ?? Math.max(...points.map((p) => p.elevation)),
        minElevation:
          session?.min_altitude ?? Math.min(...points.map((p) => p.elevation)),
        maxHeartrate:
          session?.max_heart_rate ??
          Math.max(...points.map((p) => p.heartrate)),
        minHeartrate:
          session?.min_heart_rate ??
          Math.min(...points.map((p) => p.heartrate)),
        maxSlope,
        points,
        name: name,
      });
    });
  });
};
