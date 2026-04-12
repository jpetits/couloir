"use client";

import { Activity } from "@/lib/schema";
import ProfileStats from "./ProfileStats";
import ActivityStatsWrapper from "../stats/ActivityStatsWrapper";
import { Button } from "@/components/ui/button";
import { useMapStore } from "@/store/mapStore";

export default function ProfileContent({
  activitiyList,
  username,
}: {
  activitiyList: Activity[];
  username: string;
}) {
  const yearSelection = useMapStore((state) => state.yearSelection);
  const setYearSelection = useMapStore((state) => state.setYearSelection);
  const activityIdList = useMapStore((state) => state.activityIdList);

  const yearList = Array.from(
    new Set(activitiyList.map((a) => new Date(a.date).getFullYear())),
  ).sort((a, b) => a - b);

  const activityListRendered = yearSelection
    ? activitiyList.filter(
        (a) => new Date(a.date).getFullYear() === yearSelection,
      )
    : activitiyList;

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">
        Activités publiques de {username}
      </h1>
      <div className="flex gap-2 mb-4">
        <Button
          variant={yearSelection === null ? "default" : "outline"}
          className="cursor-pointer"
          size="sm"
          onClick={() => setYearSelection(null)}
        >
          All
        </Button>
        {yearList.map((year) => (
          <Button
            key={year}
            variant={
              yearSelection === year
                ? "default"
                : activitiyList.filter(
                      (a) =>
                        activityIdList.has(a.id) &&
                        new Date(a.date).getFullYear() === year,
                    ).length > 0
                  ? "outline"
                  : "ghost"
            }
            className="cursor-pointer"
            size="sm"
            onClick={() => setYearSelection(year)}
          >
            {year}
          </Button>
        ))}
      </div>
      <ProfileStats activitiyList={activityListRendered} username={username} />
      <ActivityStatsWrapper activityList={activityListRendered} />
    </>
  );
}
