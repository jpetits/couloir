import { point, distance } from "@turf/turf";
import type { NewPoint, ParsedPoint } from "../types/types";

export const parseStravaActivity = (stravaActivity: any) => ({
  name: stravaActivity.name,
  date: new Date(stravaActivity.start_date).toISOString().split("T")[0]!,
  duration: stravaActivity.elapsed_time, // seconds
  distance: stravaActivity.distance, // meters
  elevationGain: stravaActivity.total_elevation_gain ?? 0,
  elevationLoss: stravaActivity.total_elevation_gain ?? 0, // Strava doesn't provide elev loss
  maxSpeed: (stravaActivity.max_speed ?? 0) * 3.6, // m/s → km/h
  minSpeed: 0,
  maxElevation: 0,
  minElevation: 0,
  maxHeartrate: stravaActivity.max_heartrate ?? 0,
  minHeartrate: 0,
  maxSlope: 0, // not available from Strava summary
  startLat: stravaActivity.start_latlng?.[0] ?? 0,
  startLng: stravaActivity.start_latlng?.[1] ?? 0,
});

export const parseStravaStream = (
  activityId: string,
  stravaStream: any,
): NewPoint[] => {
  if (!stravaStream || !stravaStream.latlng || !stravaStream.latlng.data) {
    return [];
  }

  const points = stravaStream.latlng.data.map((point: any, index: number) => ({
    activityId,
    lat: point[0],
    lng: point[1],
    elevation: stravaStream.altitude?.data[index] ?? 0,
    speed: (stravaStream.velocity_smooth?.data[index] ?? 0) * 3.6, // m/s → km/h
    time: new Date(stravaStream.time?.data[index] ?? 0).toISOString(),
    distance:
      (stravaStream.distance?.data[index] ?? 0) -
      (stravaStream.distance?.data[index - 1] ?? 0), // meters
    cumDistance: stravaStream.distance?.data[index] ?? 0, // meters
    heartrate: stravaStream.heartrate?.data[index] ?? 0, // bpm
  }));

  return simplifyByMaxDistance<NewPoint>(points);
};

export function simplifyByMaxDistance<T extends { lat: number; lng: number }>(
  points: T[],
  maxDistanceKm = 0.02,
): T[] {
  if (points.length === 0) return [];
  const result = [points[0]!];
  for (const p of points.slice(1)) {
    const last = result[result.length - 1]!;
    const dist = distance(point([last.lng, last.lat]), point([p.lng, p.lat]), {
      units: "kilometers",
    });
    if (dist >= maxDistanceKm || p === points[points.length - 1]) {
      result.push(p);
    }
  }
  return result;
}
