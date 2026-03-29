import { point, distance, Units } from "@turf/turf";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
