import { PointStats } from "@/types/activity";
import { point, distance, Units } from "@turf/turf";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Point } from "./schema";

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

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getDistancePoints(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
  units: Units = "meters",
): number {
  const from = point([lng1, lat1]);
  const to = point([lng2, lat2]);
  const segDist = distance(from, to, { units });
  return segDist;
}

export function activityColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 55%)`;
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

export const enrichedPointList = (points: Point[]): PointStats[] => {
  const maxSpeed = Math.max(...points.map((p) => p.speed));
  const minSpeed = Math.min(...points.map((p) => p.speed));

  const smoothedSpeeds = smoothSpeeds(points);
  return points.map((p, i) => ({
    ...p,
    cumDist: parseFloat((p.cumDist / 1000).toFixed(2)),
    speed: Math.round(p.speed),
    ele: Math.round(p.ele * 1000),
    index: i,
    speedColor: colorInterpolate(smoothedSpeeds[i], minSpeed, maxSpeed),
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
