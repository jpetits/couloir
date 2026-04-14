"use client";

import { useEffect, useState } from "react";

import { format } from "date-fns";

import { DATE_FORMAT, WEATHER_CODES } from "@/lib/constants";
import type { Activity } from "@/lib/schema";
import { ROUTES } from "@/routing/constants";

type Weather = { temp: number; windspeed: number; code: number };

export default function ActivityWeather({ activity }: { activity: Activity }) {
  const [weather, setWeather] = useState<Weather | null>(null);

  useEffect(() => {
    if (!activity.startDate || !activity.startLat || !activity.startLng) return;
    const date = format(activity.startDate, DATE_FORMAT);
    fetch(
      ROUTES.external.openMeteo(
        activity as { startLat: number; startLng: number },
        date,
      ),
    )
      .then((r) => r.json())
      .then((res) => {
        if (!res?.hourly) return;
        const hour = activity.startDate!.getUTCHours();
        setWeather({
          temp: res.hourly.temperature_2m[hour],
          windspeed: res.hourly.windspeed_10m[hour],
          code: res.hourly.weathercode[hour],
        });
      })
      .catch(() => null);
  }, [activity.id]);

  if (!weather) return null;

  const w = WEATHER_CODES[weather.code] ?? { label: "Unknown", icon: "🌡️" };
  return (
    <>{`${w.icon} ${w.label} · ${weather.temp}°C · ${weather.windspeed} km/h`}</>
  );
}
