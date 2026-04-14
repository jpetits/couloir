"use client";

import { Activity } from "@/lib/schema";
import { useMapStore } from "@/store/mapStore";

import ActivityStatsWrapper from "../stats/ActivityStatsWrapper";
import ProfileStats from "./ProfileStats";
import YearButtons from "./YearButtons";

export default function ProfileContent({
  activityList,
  username,
}: {
  activityList: Activity[];
  username: string;
}) {
  console.log(
    "ProfileContent render with activityList:",
    activityList
      .filter((a) => a.summits && a.summits.length > 0)
      .map((a) => ({ id: a.id, summits: a.summits })),
  );
  const yearSelection = useMapStore((state) => state.yearSelection);

  const activityListWithCoords = activityList.filter(
    (a) => a.startLat !== null && a.startLng !== null,
  );

  const activityListByYearSelection = yearSelection
    ? activityListWithCoords.filter(
        (a) => a.startDate.getFullYear() === yearSelection,
      )
    : activityListWithCoords;

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">
        Activités publiques de {username}
      </h1>
      <div className="flex gap-2 mb-4">
        <YearButtons activityList={activityList} />
      </div>
      <ProfileStats activityList={activityListByYearSelection} />
      <ActivityStatsWrapper activityList={activityListByYearSelection} />
    </>
  );
}
