import { cosineDistance } from "drizzle-orm";
import OpenAI from "openai";
import { activities } from "../db/schema";
import { activityRepository } from "../repositories/activity";
import type { NewActivity } from "../types/types";

export const WEATHER_CODES: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Icy fog",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Light showers",
  81: "Showers",
  82: "Heavy showers",
  85: "Snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Thunderstorm with heavy hail",
};

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function formatWeather(activity: NewActivity): string {
  const hour = activity.startDate!.getUTCHours();
  const weather = (activity.weather && JSON.parse(activity.weather)) ?? null;

  if (!weather || !weather.hourly) return "";

  const label = WEATHER_CODES[weather.hourly.weathercode[hour]] ?? "Unknown";
  return `Meteo ${label} Temperature ${weather?.hourly.temperature_2m[hour] ?? "N/A"}°C Windspeed ${weather?.hourly.windspeed_10m[hour] ?? "N/A"} km/h`;
}

function formatDate(activity: NewActivity): string {
  const month = activity.startDate!.getUTCMonth();
  //get date in human readable without numbers, only named month and year, and season
  const date = activity.startDate!.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const hour = activity.startDate!.getUTCHours();
  const timeOfDay =
    hour < 6
      ? "night"
      : hour < 12
        ? "morning"
        : hour < 18
          ? "afternoon"
          : "evening";
  const returnString = `Date ${date} Time ${timeOfDay} `;
  if (month >= 2 && month <= 4) return returnString + `Season Spring`;
  if (month >= 5 && month <= 7) return returnString + `Season Summer`;
  if (month >= 8 && month <= 10) return returnString + `Season Autumn`;
  if (month === 11 || month === 0 || month === 1)
    return returnString + `Season Winter`;
  return returnString + `Season Unknown`;
}

function formatDuration(activity: NewActivity): string {
  const hours = Math.floor(activity.duration / 3600);
  const minutes = Math.floor((activity.duration % 3600) / 60);
  const durationLabel =
    hours >= 6 ? "Full day" : hours >= 3 ? "half day" : "Short";
  return `Duration ${hours}h${minutes}m (${durationLabel})`;
}

function formatDistance(activity: NewActivity): string {
  const distanceKm = activity.distance / 1000;
  const distanceLabel =
    distanceKm >= 50
      ? "Long"
      : distanceKm >= 20
        ? "Medium"
        : distanceKm >= 5
          ? "Short"
          : "Very short";
  return `Distance ${distanceKm} km (${distanceLabel})`;
}

async function formatLocation(activity: NewActivity): Promise<string> {
  if (!activity.startLat || !activity.startLng) return "Location Unknown";
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${activity.startLat}&lon=${activity.startLng}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "couloir-app",
      },
    },
  );
  if (!res.ok) {
    console.error(
      `Failed to reverse geocode location for activity at ${activity.startLat}, ${activity.startLng}: ${res.statusText}`,
    );
    return "Location Unknown";
  }
  const data = await res.json();
  return `Location ${data.address.city ?? ""} ${data.address.town ?? ""} ${data.address.village ?? ""} ${data.address.country ?? ""}`;
}

function formatElevation(activity: NewActivity): string {
  const elevationGain = activity.elevationGain;
  const elevationLoss = activity.elevationLoss;
  const elevationLabel =
    elevationGain >= 1000
      ? "Mountainous"
      : elevationGain >= 500
        ? "Hilly"
        : elevationGain >= 100
          ? "Rolling"
          : "Flat";
  return `Elevation gain ${elevationGain} m Elevation loss ${elevationLoss} m (${elevationLabel})`;
}
export async function activityToText(activity: NewActivity): Promise<string> {
  const location = await formatLocation(activity);

  return (
    activity.name +
    " " +
    formatWeather(activity) +
    " " +
    formatDuration(activity) +
    " " +
    formatDate(activity) +
    " " +
    formatDistance(activity) +
    " " +
    location +
    " " +
    formatElevation(activity)
  );
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    input: text,
    model: "text-embedding-3-small",
  });

  return response.data[0]?.embedding ?? [];
}

export const updateActivityEmbedding = async (activityId: string) => {
  // Fetch the activity description from the database
  const activity = await activityRepository.findById(activityId);
  if (!activity) throw new Error("Activity not found");

  const activityText = await activityToText(activity);

  // Generate the embedding for the activity description
  const embedding = await generateEmbedding(activityText);

  // Update the activity with the new embedding
  await activityRepository.update(activityId, {
    embedding,
    embeddingText: activityText,
  });
};

export const searchActivitiesEmbeddings = async (
  userId: string,
  query: string,
) => {
  const queryEmbedding = await generateEmbedding(query);
  const similarityScore = cosineDistance(activities.embedding, queryEmbedding);

  return activityRepository.search(userId, query, similarityScore);
};
