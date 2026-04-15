import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { PointStats } from "@/types/activity";

import { Activity, Point } from "./schema";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(
  seconds: number,
  showSeconds: boolean = true,
): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}min`);
  if (showSeconds && secs > 0) parts.push(`${secs}s`);

  return parts.join(" ");
}

export const colorInterpolate = (
  current: number,
  min: number,
  max: number,
  baseColor: number = 240,
  toColor: number = 0,
) => {
  if (max === min) return `hsl(${baseColor}, 90%, 50%)`;
  const ratio = (current - min) / (max - min);
  const hue = Math.round(baseColor - ratio * (baseColor - toColor)); //
  return `hsl(${hue}, 90%, 50%)`;
};

export function smoothSpeeds(points: Point[], window = 5): number[] {
  return points.map((_, i) => {
    const start = Math.max(0, i - window);
    const end = Math.min(points.length - 1, i + window);
    const slice = points.slice(start, end + 1);
    return slice.reduce((s, p) => s + p.speed, 0) / slice.length;
  });
}

export const enrichPointList = (
  points: Point[],
  activity: Activity,
): PointStats[] => {
  const smoothedSpeeds = smoothSpeeds(points);
  return points.map((point, i) => ({
    ...point,
    cumDistance: parseFloat((point.cumDistance / 1000).toFixed(2)),
    speed: Math.round(point.speed),
    elevation: Math.round(point.elevation),
    index: i,
    speedColor: colorInterpolate(
      smoothedSpeeds[i],
      activity.minSpeed,
      activity.maxSpeed,
    ),
    elevationColor: colorInterpolate(
      point.elevation,
      activity.minElevation,
      activity.maxElevation,
    ),
    heartrateColor: colorInterpolate(
      point.heartrate ?? 0,
      activity.minHeartrate,
      activity.maxHeartrate,
    ),
  }));
};

export const getClosestPoint = (
  lat: number,
  lng: number,
  points: PointStats[],
): PointStats | null => {
  return points.reduce(
    (best, p) => {
      const d = Math.pow(lat - p.lat, 2) + Math.pow(lng - p.lng, 2);
      return d < best.d ? { d, p } : best;
    },
    { d: Infinity, p: null as PointStats | null },
  ).p;
};

export const getSegmentsFromPoints = (points: PointStats[]) =>
  points.map(
    (point, i) =>
      i > 0
        ? ([
            [points[i - 1]!.lat, points[i - 1]!.lng],
            [point.lat, point.lng],
          ] as [[number, number], [number, number]])
        : ([[point.lat, point.lng]] as [[number, number]]), // for the first point, create a dummy segment to be able to color it based on speed/elevation/etc
  ); // create segments between points, as we want to color each segment based on the point's speed/elevation/etc, but Leaflet doesn't support coloring individual points in a single Polyline

export const toSegmentGeojson = (
  points: PointStats[],
  heatMapField: { field: keyof PointStats; unit: string },
): GeoJSON.FeatureCollection => ({
  type: "FeatureCollection",
  features: points.flatMap((point, i) => {
    if (i === 0) return [];
    const prev = points[i - 1]!;
    return [
      {
        type: "Feature" as const,
        properties: { color: getPointColor(point, heatMapField, "idle") },
        geometry: {
          type: "LineString" as const,
          coordinates: [
            [prev.lng, prev.lat, prev.elevation],
            [point.lng, point.lat, point.elevation],
          ],
        },
      },
    ];
  }),
});

export const getPointColor = (
  point: PointStats,
  heatMapField: { field: keyof PointStats; unit: string },
  status: "hovered" | "dimmed" | "idle",
) => {
  if (status === "dimmed") {
    return "grey";
  }

  const colorField = (heatMapField.field + "Color") as keyof PointStats;
  return String(point[colorField]);
};
