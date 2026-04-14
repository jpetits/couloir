"use client";

import { memo } from "react";

import { WEATHER_CODES } from "@/lib/constants";
import type { Activity } from "@/lib/schema";

export default memo(function ActivityWeather({
  activity,
}: {
  activity: Activity;
}) {
  if (!activity?.weather?.hourly) return null;

  const hour = activity.startDate!.getUTCHours();
  const weather = activity.weather.hourly;

  const w = WEATHER_CODES[weather.weathercode[hour]] ?? {
    label: "Unknown",
    icon: "🌡️",
  };
  return (
    <>{`${w.icon} ${w.label} · ${weather?.temperature_2m[hour] ?? "N/A"}°C · ${weather?.windspeed_10m[hour] ?? "N/A"} km/h`}</>
  );
});
