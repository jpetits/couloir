import { format } from "date-fns";

import { DATE_FORMAT, WEATHER_CODES } from "@/lib/constants";
import type { Activity } from "@/lib/schema";
import { ROUTES } from "@/routing/constants";

export default async function ActivityWeather({
  activity,
}: {
  activity: Activity;
}) {
  let weather: {
    temp?: number;
    windspeed?: number;
    code?: number;
    weather: { label: string; icon: string };
  } | null = {
    weather: {
      label: "Unknown",
      icon: "🌡️",
    },
  };

  if (activity.startDate && activity.startLat && activity.startLng) {
    const date = format(activity.startDate, DATE_FORMAT);

    const res = await fetch(
      ROUTES.external.openMeteo(
        activity as { startLat: number; startLng: number },
        date,
      ),
      { next: { revalidate: 86400 } },
    )
      .then((r) => r.json())
      .catch(() => null);

    if (res?.hourly) {
      const hour = activity.startDate.getUTCHours();
      weather = {
        temp: res.hourly.temperature_2m[hour],
        windspeed: res.hourly.windspeed_10m[hour],
        code: res.hourly.weathercode[hour],
        weather: WEATHER_CODES[res.hourly.weathercode[hour]],
      };
    }
  }

  return (
    <>
      {` · ${weather?.weather.icon} ${weather?.weather.label} · ${weather?.temp}°C · ${weather?.windspeed} km/h`}
    </>
  );
}
