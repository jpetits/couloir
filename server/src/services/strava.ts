import { userRepository } from "../repositories/user";
import { activityRepository } from "../repositories/activity";
import { pointRepository } from "../repositories/point";
import { parseStravaActivity, parseStravaStream } from "./stravaParser";
import type { users, activities } from "../db/schema";
import { processQueue } from "./queue";
import { sendMessage } from "./websocket";

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
  const existing = await activityRepository.findStravaIdsByUser(userId);
  const existingIds = new Set(existing.map((a) => a.stravaActivityId));

  const activitiesToInsert = stravaActivities
    .filter((a) => !existingIds.has(String(a.id)))
    .map((a) => ({
      ...parseStravaActivity(a),
      userId,
      stravaActivityId: String(a.id),
    }));

  return await activityRepository.createMany(activitiesToInsert);
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

const fetchStreamsForActivity = async (
  user: typeof users.$inferSelect,
  activityId: string,
) => {
  const accessToken = await getOrRefreshStravaAccessToken(user);
  const streamsResponse = await fetch(
    `https://www.strava.com/api/v3/activities/${activityId}/streams?keys=latlng,altitude,time,velocity_smooth&key_by_type=true`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!streamsResponse.ok) {
    throw new Error(
      `Failed to fetch streams for Strava activity ID ${activityId}`,
    );
  }

  return await streamsResponse.json();
};

const queueActivitiesForProcessing = async (
  activityList: (typeof activities.$inferSelect)[],
  user: typeof users.$inferSelect,
) => {
  await processQueue(activityList, async (stravaActivity, index) => {
    if (!stravaActivity.stravaActivityId) {
      console.warn(
        `Skipping activity ${stravaActivity.id} because it has no Strava ID`,
      );
      return;
    }

    const streams = await fetchStreamsForActivity(
      user,
      stravaActivity.stravaActivityId,
    );

    const points = parseStravaStream(stravaActivity.id, streams);

    if (!points || points.length === 0) {
      console.warn(
        `No valid points found for activity ${stravaActivity.id}, skipping`,
      );
      return;
    }

    await pointRepository.create(points);
    sendMessage(user.id, {
      type: "sync:progress",
      progress: Math.round(((index + 1) / activityList.length) * 100),
    });
  });
};

export const syncStravaActivities = async (user: typeof users.$inferSelect) => {
  sendMessage(user.id, {
    type: "sync:start",
  });

  let allInserted = [];

  try {
    const accessToken = await getOrRefreshStravaAccessToken(user);

    const allStravaActivities = await batchFetchStravaActivities(accessToken);

    if (allStravaActivities.length === 0) {
      console.warn(`No Strava activities found for user ${user.id}`);
      sendMessage(user.id, {
        type: "sync:done",
        count: 0,
      });
      return;
    }

    allInserted = await createOrUpdateActivities(allStravaActivities, user.id);

    await queueActivitiesForProcessing(allInserted, user);
  } catch (error) {
    console.error("Error syncing Strava activities:", error);
    sendMessage(user.id, {
      type: "sync:error",
      message: (error as Error).message,
    });
    return;
  }

  console.warn(
    `Finished syncing Strava activities for user ${user.id}. Total activities processed: ${allInserted.length}`,
  );

  sendMessage(user.id, {
    type: "sync:done",
    count: allInserted.length,
  });
};
