import FitParser from "fit-file-parser";
import { lineString, point, distance } from "@turf/turf";
import turfLength from "@turf/length";

export interface TrackPoint {
  lat: number;
  lng: number;
  ele: number;
  speed: number; // km/h
  time: string; // ISO string
}

export interface ParsedSession {
  date: Date;
  duration: number; // secondes
  distance: number; // mètres
  elevGain: number; // dénivelé positif
  elevLoss: number; // dénivelé négatif
  maxSpeed: number; // km/h
  maxSlope: number; // degrés
  points: TrackPoint[];
}

const fitParser = new FitParser({
  force: true,
  speedUnit: "km/h",
  lengthUnit: "km",
  temperatureUnit: "celsius",
  elapsedRecordField: true,
});

const getStatsFromPoints = (points: TrackPoint[]) => {
  // Distance totale avec Turf
  const line = lineString(points.map((p) => [p.lng, p.lat]));
  const totalDistance = turfLength(line, { units: "meters" });

  // Dénivelé + pente max
  let elevGain = 0;
  let elevLoss = 0;
  let maxSlope = 0;

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1] as TrackPoint;
    const curr = points[i] as TrackPoint;
    const diff = curr.ele - prev.ele;
    if (diff > 0) elevGain += diff;
    else elevLoss += Math.abs(diff);

    // Pente avec Turf pour la distance
    const from = point([prev.lng, prev.lat]);
    const to = point([curr.lng, curr.lat]);
    const segDist = distance(from, to, "meters");

    if (segDist > 0) {
      const slope = Math.atan(Math.abs(diff) / segDist) * (180 / Math.PI);
      if (slope > maxSlope) maxSlope = slope;
    }
  }

  return { totalDistance, elevGain, elevLoss, maxSlope };
};

export const parseFitFile = (fileBuffer: Buffer) => {
  return new Promise((resolve, reject) => {
    fitParser.parse(fileBuffer as Buffer<ArrayBuffer>, (error, data) => {
      if (error) {
        if (error) return reject(error);

        const records = data?.records ?? [];

        const points: TrackPoint[] = records
          .filter((r) => r.position_lat && r.position_long)
          .map((r) => ({
            lat: r.position_lat as number,
            lng: r.position_long as number,
            ele: r.altitude ?? 0,
            speed: r.speed ?? 0,
            time: new Date(r.timestamp)?.toISOString() ?? "",
          }));

        if (!points || points.length === 0)
          return reject(new Error("No GPS data found"));

        const { totalDistance, elevGain, elevLoss, maxSlope } =
          getStatsFromPoints(points);

        const session = data?.sessions?.[0];
        const firstPoint = points[0];

        resolve({
          date: firstPoint?.time ? new Date(firstPoint.time) : new Date(),
          duration: session?.total_timer_time ?? 0,
          distance: totalDistance,
          elevGain: Math.round(elevGain),
          elevLoss: Math.round(elevLoss),
          maxSpeed:
            session?.max_speed ?? Math.max(...points.map((p) => p.speed)),
          maxSlope: Math.round(maxSlope),
          points,
        });
      }
    });
  });
};
