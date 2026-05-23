import { Injectable } from "@nestjs/common";
import { ActivityRepository } from "../activity/activity.repository";
import { EmbeddingService } from "../activity/embedding.service";
import type { activities, users } from "../db/schema";
import { PointRepository } from "../point/point.repository";
import type { StravaActivity, StravaStream } from "../types/types";
import { UserRepository } from "../user/user.repository";
import { ImmichService } from "./immich.service";
import { QueueService } from "./queue.service";
import { StravaParserService } from "./stravaParser.service";
import { WeatherService } from "./weather.service";
import { WebsocketGateway } from "./websocket.gateway";

@Injectable()
export class StravaService {
  constructor(
    private readonly stravaParserService: StravaParserService,
    private readonly immichService: ImmichService,
    private readonly queueService: QueueService,
    private readonly weatherService: WeatherService,
    private readonly embeddingService: EmbeddingService,
    private readonly pointRepository: PointRepository,
    private readonly activityRepository: ActivityRepository,
    private readonly userRepository: UserRepository,
    private readonly websocketGateway: WebsocketGateway,
  ) {}

  async handleStravaCallback(code: string, userId: string) {
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

    const data = (await response.json()) as {
      access_token: string;
      refresh_token: string;
      expires_in: number;
      athlete: {
        id: string;
      };
    };

    await this.userRepository.update(userId, {
      stravaAccessToken: data.access_token,
      stravaRefreshToken: data.refresh_token,
      stravaTokenExpiresAt: new Date(Date.now() + data.expires_in * 1000),
      stravaAthleteId: data.athlete.id,
    });
  }

  async createOrUpdateActivities(
    stravaActivities: StravaActivity[],
    userId: string,
  ) {
    const existing = await this.activityRepository.findStravaIdsByUser(userId);
    const existingIds = new Set(existing.map((a) => a.stravaActivityId));

    const parsed = stravaActivities
      .filter((a) => !existingIds.has(String(a.id)))
      .map((a) => ({
        ...this.stravaParserService.parseStravaActivity(a),
        userId,
        stravaActivityId: String(a.id),
      }));

    if (parsed.length === 0) {
      return [];
    }

    const activitiesToInsert: (typeof activities.$inferInsert)[] = [];
    await this.queueService.processQueue(
      parsed,
      async (activity, index) => {
        this.websocketGateway.sendMessage(userId, {
          type: "sync:progress",
          progress: Math.round(((index + 1) / parsed.length) * 50),
        });
        activitiesToInsert.push({
          ...activity,
          weather: JSON.stringify(
            await this.weatherService.fetchWeatherForActivity(activity),
          ),
        });
      },
      1000,
    );

    return await this.activityRepository.createMany(activitiesToInsert);
  }

  async getOrRefreshStravaAccessToken(user: typeof users.$inferSelect) {
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

    const refreshData = (await refreshResponse.json()) as {
      access_token: string;
      refresh_token: string;
      expires_in: number;
    };

    await this.userRepository.update(user.id, {
      stravaAccessToken: refreshData.access_token,
      stravaRefreshToken: refreshData.refresh_token,
      stravaTokenExpiresAt: new Date(
        Date.now() + refreshData.expires_in * 1000,
      ),
    });

    return refreshData.access_token;
  }

  async batchFetchStravaActivities(
    accessToken: string,
  ): Promise<StravaActivity[]> {
    let page = 1;
    let allStravaActivities: StravaActivity[] = [];

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

      const stravaActivities =
        (await activitiesResponse.json()) as StravaActivity[];
      if (stravaActivities.length === 0) {
        break;
      }

      allStravaActivities = allStravaActivities.concat(stravaActivities);
      page++;
    }

    return allStravaActivities;
  }

  async fetchStreamsForActivity(
    user: typeof users.$inferSelect,
    activityId: string,
  ) {
    const accessToken = await this.getOrRefreshStravaAccessToken(user);
    const streamsResponse = await fetch(
      `https://www.strava.com/api/v3/activities/${activityId}/streams?keys=latlng,altitude,time,velocity_smooth,distance,heartrate&key_by_type=true`,
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

    return (await streamsResponse.json()) as StravaStream;
  }

  async queueActivitiesForProcessing(
    activityList: (typeof activities.$inferSelect)[],
    user: typeof users.$inferSelect,
  ) {
    await this.queueService.processQueue(
      activityList,
      async (stravaActivity, index) => {
        if (!stravaActivity.stravaActivityId) {
          console.warn(
            `Skipping activity ${stravaActivity.id} because it has no Strava ID`,
          );
          return;
        }

        const streams = await this.fetchStreamsForActivity(
          user,
          stravaActivity.stravaActivityId,
        );

        const points = this.stravaParserService.parseStravaStream(
          stravaActivity.id,
          streams,
        );

        if (!points || points.length === 0) {
          console.warn(
            `No valid points found for activity ${stravaActivity.id}, skipping`,
          );
          return;
        }

        const pointList = await this.pointRepository.create(points);

        const minSpeed = Math.min(...pointList.map((p) => p.speed));
        const minElevation = Math.min(...pointList.map((p) => p.elevation));
        const maxElevation = Math.max(...pointList.map((p) => p.elevation));
        const maxHeartrate = Math.max(...pointList.map((p) => p.heartrate));
        const minHeartrate = Math.min(...pointList.map((p) => p.heartrate));

        await this.activityRepository.updateByUserId(
          stravaActivity.id,
          user.id,
          {
            minSpeed,
            minElevation,
            maxElevation,
            maxHeartrate,
            minHeartrate,
          },
        );

        await this.embeddingService.updateActivityEmbedding(stravaActivity.id);

        this.websocketGateway.sendMessage(user.id, {
          type: "sync:progress",
          progress: Math.round(((index + 1) / activityList.length) * 50),
        });
      },
    );
  }

  async createOrUpdateActivityListWithPoints(
    activityList: StravaActivity[],
    user: typeof users.$inferSelect,
  ) {
    const allInserted = await this.createOrUpdateActivities(
      activityList,
      user.id,
    );

    await this.queueActivitiesForProcessing(allInserted, user);
    if (allInserted.length > 0) {
      await this.immichService.syncImmichAssets(user.id, allInserted);
    }

    return allInserted;
  }

  syncStravaActivities = async (user: typeof users.$inferSelect) => {
    this.websocketGateway.sendMessage(user.id, {
      type: "sync:start",
    });

    let allInserted: (typeof activities.$inferSelect)[] = [];

    try {
      const accessToken = await this.getOrRefreshStravaAccessToken(user);

      const allStravaActivities =
        await this.batchFetchStravaActivities(accessToken);

      allInserted = await this.createOrUpdateActivityListWithPoints(
        allStravaActivities,
        user,
      );
    } catch (error) {
      console.error("Error syncing Strava activities:", error);
      this.websocketGateway.sendMessage(user.id, {
        type: "sync:error",
        message: (error as Error).message,
      });
      return;
    }

    console.warn(
      `Finished syncing Strava activities for user ${user.id}. Total activities processed: ${allInserted.length}`,
    );

    this.websocketGateway.sendMessage(user.id, {
      type: "sync:done",
      count: allInserted.length,
    });
  };

  async handleStravaWebhook(stravaActivityId: string, stravaAthleteId: string) {
    const user =
      await this.userRepository.findByStravaAthleteId(stravaAthleteId);
    if (!user) {
      console.warn(
        `Received Strava webhook for activity ID ${stravaActivityId} but no matching user found`,
      );
      return;
    }
    const accessToken = await this.getOrRefreshStravaAccessToken(user);
    const activityResponse = await fetch(
      `https://www.strava.com/api/v3/activities/${stravaActivityId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!activityResponse.ok) {
      throw new Error(
        `Failed to fetch Strava activity with ID ${stravaActivityId}`,
      );
    }

    const stravaActivity = (await activityResponse.json()) as StravaActivity;

    await this.createOrUpdateActivityListWithPoints([stravaActivity], user);
  }
}
