import { lineString, point, distance, simplify } from "@turf/turf";
import { type ParsedPoint } from "../types/types";

export const parseStravaActivity = (stravaActivity: any) => ({
  name: stravaActivity.name,
  date: new Date(stravaActivity.start_date).toISOString().split("T")[0]!,
  duration: stravaActivity.elapsed_time, // seconds
  distance: stravaActivity.distance, // meters
  elevGain: stravaActivity.total_elevation_gain ?? 0,
  elevLoss: stravaActivity.total_elevation_gain ?? 0, // Strava doesn't provide elev loss
  maxSpeed: (stravaActivity.max_speed ?? 0) * 3.6, // m/s → km/h
  maxSlope: 0, // not available from Strava summary
});

export const parseStravaStream = (activityId: string, stravaStream: any) => {
  if (!stravaStream || !stravaStream.latlng || !stravaStream.latlng.data) {
    return [];
  }

  const points = stravaStream.latlng.data.map((point: any, index: number) => ({
    activityId,
    lat: point[0],
    lng: point[1],
    ele: (stravaStream.altitude?.data[index] ?? 0) / 1000,
    speed: (stravaStream.velocity_smooth?.data[index] ?? 0) * 3.6, // m/s → km/h
    time: new Date(stravaStream.time?.data[index] ?? 0).toISOString(),
    dist:
      (stravaStream.distance?.data[index] ?? 0) -
      (stravaStream.distance?.data[index - 1] ?? 0), // meters
    cumDist: stravaStream.distance?.data[index] ?? 0, // meters
  }));

  const line = lineString(points.map((p: ParsedPoint) => [p.lng, p.lat]));
  const simplified = simplify(line, { tolerance: 0.0001, highQuality: false });
  const simplifiedCoords = new Set(
    simplified.geometry.coordinates.map(([lng, lat]) => `${lng},${lat}`),
  );

  return points.filter((r: ParsedPoint) =>
    simplifiedCoords.has(`${r.lng},${r.lat}`),
  );
};
