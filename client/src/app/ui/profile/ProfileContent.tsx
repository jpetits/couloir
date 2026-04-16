"use client";

import { useState } from "react";

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
  const [showStats, setShowStats] = useState(false);

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

      <div className="relative overflow-hidden">
        <div className="hidden md:block mt-4">
          <ProfileStats activityList={activityListByYearSelection} />
        </div>

        <ActivityStatsWrapper activityList={activityListByYearSelection} />

        {/* Mobile bottom sheet toggle — hidden on desktop */}
        <div className="md:hidden absolute bottom-0 left-0 right-0 z-1000 flex justify-center pb-2 pointer-events-none">
          <Button
            variant="outline"
            size="sm"
            className="shadow-lg bg-background pointer-events-auto"
            onClick={() => setShowStats((v) => !v)}
          >
            {showStats ? (
              <ChevronDown className="w-4 h-4 mr-1" />
            ) : (
              <ChevronUp className="w-4 h-4 mr-1" />
            )}
            Calendar
          </Button>
        </div>

        {/* Mobile bottom sheet panel */}
        <div
          className={`md:hidden absolute bottom-0 left-0 right-0 z-999 bg-background border-t px-4 pt-3 pb-4 transition-transform duration-300 ${showStats ? "translate-y-0" : "translate-y-full"}`}
        >
          <ProfileStats activityList={activityListByYearSelection} />
        </div>
      </div>
    </>
  );
}
