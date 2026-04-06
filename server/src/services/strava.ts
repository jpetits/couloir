import { userRepository } from "../repositories/user";
import { activityRepository } from "../repositories/activity";
import { parseStravaActivity } from "./stravaParser";
import type { users } from "../db/schema";

export const handleStravaCallback = async (code: string, userId: string) => {
  const response = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to exchange code for tokens");
  }

  const data = await response.json();

  await userRepository.update(userId, {
    stravaAccessToken: data.access_token,
    stravaRefreshToken: data.refresh_token,
    stravaTokenExpiresAt: new Date(Date.now() + data.expires_in * 1000),
  });
};

const createOrUpdateActivities = async (
  stravaActivities: any[],
  userId: string,
) => {
  for (const stravaActivity of stravaActivities) {
    const existingActivity = await activityRepository.findByStravaId(
      stravaActivity.id,
      userId,
    );

    if (existingActivity) {
      continue; // Skip if activity already exists
    }

    const newActivity = await activityRepository.create({
      ...parseStravaActivity(stravaActivity),
      userId,
      stravaActivityId: String(stravaActivity.id),
    });

    if (!newActivity) {
      console.warn(
        `Failed to create activity for Strava activity ID ${stravaActivity.id}`,
      );
    }
  }
};

const getOrRefreshStravaAccessToken = async (
  user: typeof users.$inferSelect,
) => {
  if (
    !user ||
    !user.stravaAccessToken ||
    !user.stravaRefreshToken ||
    !user.stravaTokenExpiresAt
  ) {
    throw new Error("User not found or Strava account not linked");
  }

  const isTokenExpired = new Date() >= user.stravaTokenExpiresAt;

  if (!isTokenExpired) {
    return user.stravaAccessToken;
  }

  const refreshResponse = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      refresh_token: user.stravaRefreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!refreshResponse.ok) {
    throw new Error("Failed to refresh Strava access token");
  }

  const refreshData = await refreshResponse.json();

  await userRepository.update(user.id, {
    stravaAccessToken: refreshData.access_token,
    stravaRefreshToken: refreshData.refresh_token,
    stravaTokenExpiresAt: new Date(Date.now() + refreshData.expires_in * 1000),
  });

  return refreshData.access_token;
};

const batchFetchStravaActivities = async (
  accessToken: string,
): Promise<any[]> => {
  let page = 1;
  let allStravaActivities: any[] = [];

  while (true) {
    const activitiesResponse = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?per_page=200&page=${page}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!activitiesResponse.ok) {
      throw new Error("Failed to fetch Strava activities");
    }

    const stravaActivities = await activitiesResponse.json();
    if (stravaActivities.length === 0) {
      break;
    }

    allStravaActivities = allStravaActivities.concat(stravaActivities);
    page++;
  }

  return allStravaActivities;
};

export const syncStravaActivities = async (user: typeof users.$inferSelect) => {
  const accessToken = await getOrRefreshStravaAccessToken(user);

  const allStravaActivities = await batchFetchStravaActivities(accessToken);

  createOrUpdateActivities(allStravaActivities, user.id);
};
