"use client";

import { useEffect, useState } from "react";

import { ChevronDown, ChevronUp } from "lucide-react";

import { Button } from "@/components/ui/button";
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
  const yearSelection = useMapStore((state) => state.yearSelection);
  const setProfileUsername = useMapStore((state) => state.setProfileUsername);
  const [showCalendar, setShowCalendar] = useState(false);
  const showSideBar = useMapStore((state) => state.showSideBar);

  const setSelectedActivityId = useMapStore(
    (state) => state.setSelectedActivityId,
  );
  const setHoveredActivity = useMapStore((state) => state.setHoveredActivity);

  useEffect(() => {
    setProfileUsername(username);
    return () => setProfileUsername(null);
  }, [username]);

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
      <div className="relative overflow-hidden">
        <ActivityStatsWrapper activityList={activityListByYearSelection} />

        <div className="absolute bottom-0 left-0 right-0 z-500 flex justify-center pb-6 pointer-events-none">
          {!showSideBar && (
            <Button
              variant="outline"
              size="sm"
              className="shadow-lg bg-background pointer-events-auto"
              onClick={() => {
                setShowCalendar((v) => !v);
                setSelectedActivityId(null);
                setHoveredActivity(null);
              }}
            >
              {showCalendar ? (
                <ChevronDown className="w-4 h-4 mr-1" />
              ) : (
                <ChevronUp className="w-4 h-4 mr-1" />
              )}
              Calendar
            </Button>
          )}
        </div>

        {showCalendar && (
          <div className="absolute bottom-0 left-0 right-0 z-499 bg-background border-t px-4 pt-2 pb-7">
            <div className="flex gap-2 mb-2">
              <YearButtons activityList={activityList} />
            </div>
            <ProfileStats activityList={activityListByYearSelection} />
          </div>
        )}
      </div>
    </>
  );
}
