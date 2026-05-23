import { Injectable } from "@nestjs/common";
import { cosineDistance } from "drizzle-orm";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import z from "zod";
import { ActivityRepository } from "./activity.repository";
import { activities } from "../db/schema";
import type { ActivityFilters } from "../schema/query";
import type { NewActivity, NominatimResponse } from "../types/types";

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

@Injectable()
export class EmbeddingService {
  private readonly openai: OpenAI;

  constructor(private readonly activityRepository: ActivityRepository) {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  formatWeather(activity: NewActivity): string {
    const hour = activity.startDate!.getUTCHours();
    const weather = (activity.weather && JSON.parse(activity.weather)) ?? null;

    if (!weather || !weather.hourly) return "";

    const label = WEATHER_CODES[weather.hourly.weathercode[hour]] ?? "Unknown";
    return `Meteo ${label} Temperature ${weather?.hourly.temperature_2m[hour] ?? "N/A"}°C Windspeed ${weather?.hourly.windspeed_10m[hour] ?? "N/A"} km/h`;
  }

  formatDate(activity: NewActivity): string {
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

  formatDuration(activity: NewActivity): string {
    const hours = Math.floor(activity.duration / 3600);
    const minutes = Math.floor((activity.duration % 3600) / 60);
    const durationLabel =
      hours >= 6 ? "Full day" : hours >= 3 ? "half day" : "Short";
    return `Duration ${hours}h${minutes}m (${durationLabel})`;
  }

  formatDistance(activity: NewActivity): string {
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

  async formatLocation(activity: NewActivity): Promise<string> {
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
    const data = (await res.json()) as NominatimResponse;
    return `Location ${data.address.city ?? ""} ${data.address.town ?? ""} ${data.address.village ?? ""} ${data.address.country ?? ""}`;
  }

  formatElevation(activity: NewActivity): string {
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
  async activityToText(activity: NewActivity): Promise<string> {
    const location = await this.formatLocation(activity);

    return (
      activity.name +
      " " +
      this.formatWeather(activity) +
      " " +
      this.formatDuration(activity) +
      " " +
      this.formatDate(activity) +
      " " +
      this.formatDistance(activity) +
      " " +
      location +
      " " +
      this.formatElevation(activity)
    );
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      input: text,
      model: "text-embedding-3-small",
    });

    return response.data[0]?.embedding ?? [];
  }

  async updateActivityEmbedding(activityId: string) {
    // Fetch the activity description from the database
    const activity = await this.activityRepository.findById(activityId);
    if (!activity) throw new Error("Activity not found");

    const activityText = await this.activityToText(activity);

    // Generate the embedding for the activity description
    const embedding = await this.generateEmbedding(activityText);

    // Update the activity with the new embedding
    await this.activityRepository.update(activityId, {
      embedding,
      embeddingText: activityText,
    });
  }

  async searchActivitiesEmbeddings(userId: string, query: string) {
    const queryEmbedding = await this.generateEmbedding(query);
    const similarityScore = cosineDistance(
      activities.embedding,
      queryEmbedding,
    );

    return this.activityRepository.search(userId, query, similarityScore);
  }

  QueryParseSchema = z.object({
    semanticQuery: z
      .string()
      .nullable()
      .describe(
        "The semantic/conceptual part of the query for vector search, null if purely structural",
      ),
    filters: z.object({
      dateFrom: z
        .string()
        .nullable()
        .describe("ISO date string for start date filter"),
      dateTo: z
        .string()
        .nullable()
        .describe("ISO date string for end date filter"),
      minDistance: z.number().nullable().describe("Minimum distance in meters"),
      maxDistance: z.number().nullable().describe("Maximum distance in meters"),
      minDuration: z
        .number()
        .nullable()
        .describe("Minimum duration in seconds"),
      maxDuration: z
        .number()
        .nullable()
        .describe("Maximum duration in seconds"),
      minElevationGain: z
        .number()
        .nullable()
        .describe("Minimum elevation gained in meters d+"),
      maxElevationGain: z
        .number()
        .nullable()
        .describe("Maximum elevation gained in meters d+"),
      maxElevationLoss: z
        .number()
        .nullable()
        .describe("Maximum elevation loss in meters d-"),
      minElevationLoss: z
        .number()
        .nullable()
        .describe("Minimum elevation loss in meters d-"),
      minSpeed: z.number().nullable().describe("Minimum speed in km/h"),
      maxSpeed: z.number().nullable().describe("Maximum speed in km/h"),
    }),
  });

  async parseQuery(query: string) {
    const response = await this.openai.chat.completions.parse({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Extract structured filters and semantic queries from outdoor sports activity search queries (skiing, hiking, cycling, surfing, etc.).
Extract explicit filters (dates, distances, durations, elevation gain/loss). Distance in meters, duration in seconds.
Set semanticQuery to null when the query is FULLY captured by filters — no conceptual or descriptive meaning remains (e.g. "activities over 20km in January" → null, "long hikes in the Alps" → "long hikes in the Alps").
Only set semanticQuery when there is a descriptive or conceptual part that cannot be expressed as a filter.`,
        },
        { role: "user", content: query },
      ],
      response_format: zodResponseFormat(this.QueryParseSchema, "query_parse"),
    });
    return response.choices[0]!.message.parsed!;
  }

  rrf(lists: { id: string }[][], k = 60): string[] {
    const scores = new Map<string, number>();
    for (const list of lists) {
      list.forEach((item, rank) => {
        scores.set(item.id, (scores.get(item.id) ?? 0) + 1 / (k + rank + 1));
      });
    }
    return [...scores.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id);
  }

  async hybridSearchActivities(userId: string, query: string) {
    const parsed = await this.parseQuery(query);

    const sqlFilters: Partial<ActivityFilters> = {};
    if (parsed.filters.dateFrom)
      sqlFilters.dateFrom = new Date(parsed.filters.dateFrom);
    if (parsed.filters.dateTo)
      sqlFilters.dateTo = new Date(parsed.filters.dateTo);
    if (parsed.filters.minDistance != null)
      sqlFilters.minDistance = parsed.filters.minDistance;
    if (parsed.filters.maxDistance != null)
      sqlFilters.maxDistance = parsed.filters.maxDistance;
    if (parsed.filters.minDuration != null)
      sqlFilters.minDuration = parsed.filters.minDuration;
    if (parsed.filters.maxDuration != null)
      sqlFilters.maxDuration = parsed.filters.maxDuration;
    if (parsed.filters.minElevationGain != null)
      sqlFilters.minElevationGain = parsed.filters.minElevationGain;
    if (parsed.filters.maxElevationLoss != null)
      sqlFilters.maxElevationLoss = parsed.filters.maxElevationLoss;
    if (parsed.filters.minSpeed != null)
      sqlFilters.minSpeed = parsed.filters.minSpeed;
    if (parsed.filters.maxSpeed != null)
      sqlFilters.maxSpeed = parsed.filters.maxSpeed;

    const hasFilters = Object.keys(sqlFilters).length > 0;
    const semanticQuery = parsed.semanticQuery;
    console.log("[hybrid]", { semanticQuery, sqlFilters, hasFilters });

    if (hasFilters && semanticQuery === null) {
      return this.activityRepository.searchByFilters(userId, sqlFilters);
    }

    if (!hasFilters && semanticQuery === null) {
      return this.searchActivitiesEmbeddings(userId, query);
    }

    const [sqlResults, embeddingResults] = await Promise.all([
      hasFilters
        ? this.activityRepository.searchByFilters(userId, sqlFilters)
        : Promise.resolve([]),
      this.searchActivitiesEmbeddings(userId, semanticQuery!),
    ]);

    const rankedIds = this.rrf([sqlResults, embeddingResults]);

    const allById = new Map(
      [...sqlResults, ...embeddingResults].map((a) => [a.id, a]),
    );
    return rankedIds.map((id) => allById.get(id)!).filter(Boolean);
  }
}
