import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { ActivityRepository } from "../activity/activity.repository";
import { activities, images } from "../db/schema";
import * as schema from "../db/schema";
import type { ImmichImage } from "../types/types";

@Injectable()
export class ImmichService {
  private readonly immichUrl: string;
  private readonly immichApiKey: string;
  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject("DB") private readonly db: PostgresJsDatabase<typeof schema>,
    private readonly activityRepository: ActivityRepository,
  ) {
    this.immichUrl = this.configService.getOrThrow("IMMICH_URL");
    this.immichApiKey = this.configService.getOrThrow("IMMICH_API_KEY");
  }

  async fetchImmichAssetsWithGps(takenAfter?: Date, takenBefore?: Date) {
    let page = 1;
    let hasMore = true;
    const results: ImmichImage[] = [];

    while (hasMore) {
      let res: Response | null = null;
      for (let attempt = 1; attempt <= 3; attempt++) {
        res = await fetch(`${this.immichUrl}/api/search/metadata`, {
          method: "POST",
          headers: {
            "x-api-key": this.immichApiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            page,
            size: 100,
            withExif: true,
            ...(takenAfter && { takenAfter: takenAfter.toISOString() }),
            ...(takenBefore && { takenBefore: takenBefore.toISOString() }),
          }),
        });
        if (res.ok) break;
        console.warn(
          `Immich search failed: ${res.status} ${res.statusText} — URL: ${this.immichUrl}/api/search/metadata, key: ${this.immichApiKey?.slice(0, 6)}... (attempt ${attempt}/3)`,
        );
      }
      if (!res!.ok) {
        console.warn("Immich search failed after 3 attempts, skipping");
        break;
      }
      const data = (await res?.json()) as { assets?: { items: ImmichImage[] } };
      const items = data.assets?.items ?? [];
      results.push(...items);
      hasMore = items.length === 100;
      page++;
    }

    console.log(`Fetched ${results.length} assets`);
    const resultsWithGps = results.filter(
      (a) => a.exifInfo?.latitude && a.exifInfo?.longitude,
    );
    return resultsWithGps;
  }

  async syncImmichAssets(
    userId: string,
    activityList?: (typeof activities.$inferInsert)[],
  ) {
    let takenAfter: Date | undefined;
    let takenBefore: Date | undefined;

    if (activityList && activityList.length > 0) {
      const starts = activityList
        .map((a) => a.startDate)
        .filter((d): d is Date => d instanceof Date);
      const ends = activityList
        .filter((a) => a.startDate instanceof Date)
        .map(
          (a) =>
            new Date(
              (a.startDate as Date).getTime() + (a.duration as number) * 1000,
            ),
        );

      if (starts.length > 0) {
        takenAfter = new Date(Math.min(...starts.map((d) => d.getTime())));
        takenBefore = new Date(Math.max(...ends.map((d) => d.getTime())));
      }
    }

    const assets = await this.fetchImmichAssetsWithGps(takenAfter, takenBefore);

    const activityListToMatch =
      activityList ??
      (await this.activityRepository.list(userId, {
        limit: 10000,
      }));

    for (const asset of assets) {
      const lat = asset.exifInfo!.latitude!;
      const lng = asset.exifInfo!.longitude!;
      const date = asset.fileCreatedAt!;

      const imageDateCreated = new Date(date);

      const matchedActivities = activityListToMatch.filter((activity) => {
        if (!activity.startDate) return false;
        const activityDate = new Date(activity.startDate);

        return (
          imageDateCreated >= activityDate &&
          imageDateCreated.getTime() <=
            activityDate.getTime() + activity.duration * 1000 // within activity duration
        );
      });

      const activityId = matchedActivities[0]?.id;
      if (!activityId) continue;

      await this.db.insert(images).values({
        activityId,
        immichId: asset.id,
        takenAt: imageDateCreated,
        lat,
        lng,
      });

      console.log(`Matched asset ${asset.id} to activity ${activityId}`);
    }
  }
}
