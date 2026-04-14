export async function fetchWeatherForActivity(activity: {
  startLat: number | null;
  startLng: number | null;
  startDate: Date | null;
  duration: number | null;
}): Promise<object> {
  if (
    !activity.startLat ||
    !activity.startLng ||
    !activity.startDate ||
    !activity.duration ||
    activity.duration <= 0
  ) {
    return {};
  }

  const startDate = activity.startDate.toISOString().split("T")[0];
  const endDate = new Date(
    activity.startDate.getTime() + activity.duration * 1000,
  )
    .toISOString()
    .split("T")[0];

  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${activity.startLat}&longitude=${activity.startLng}&start_date=${startDate}&end_date=${endDate}&hourly=temperature_2m,weathercode,windspeed_10m&timezone=UTC`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();

  if (!res.ok) {
    console.error(
      `Failed to fetch weather data for activity at ${activity.startLat}, ${activity.startLng} from ${startDate} to ${endDate}: ${data.error || res.statusText}`,
    );
    return {};
  }

  return data;
}
