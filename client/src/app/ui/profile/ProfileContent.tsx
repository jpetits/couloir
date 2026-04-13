"use client";

import { Activity } from "@/lib/schema";
import ProfileStats from "./ProfileStats";
import ActivityStatsWrapper from "../stats/ActivityStatsWrapper";
import { useMapStore } from "@/store/mapStore";
import YearButtons from "./YearButtons";

export default function ProfileContent({
  activityList,
  username,
}: {
  activityList: Activity[];
  username: string;
}) {
  const yearSelection = useMapStore((state) => state.yearSelection);

  const activityListByYearSelection = yearSelection
    ? activityList.filter(
        (a) => new Date(a.date).getFullYear() === yearSelection,
      )
    : activityList;

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">
        Activités publiques de {username}
      </h1>
      <div className="flex gap-2 mb-4">
        <YearButtons activityList={activityList} />
      </div>
      <ProfileStats activitiyList={activityListByYearSelection} />
      <ActivityStatsWrapper activityList={activityListByYearSelection} />
    </>
  );
}
