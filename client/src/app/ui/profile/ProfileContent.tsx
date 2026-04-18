"use client";

import { useEffect, useState } from "react";

import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ChevronDown, ChevronUp, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { useIsMobile } from "@/context/DeviceContext";
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
  const isMobile = useIsMobile();
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

        <div className="absolute bottom-0 left-0 right-0 z-10000 flex justify-center pointer-events-none">
          {!showSideBar && (
            <Button
              variant="outline"
              size="sm"
              className="shadow-lg bg-background pointer-events-auto cursor-pointer"
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
              <span className={showCalendar ? "hidden md:block" : "block"}>
                Calendar
              </span>
            </Button>
          )}
        </div>

        <Drawer
          modal={false}
          open={showCalendar}
          onOpenChange={setShowCalendar}
        >
          <DrawerContent
            className="z-9999 px-4 pb-2 mb-4"
            aria-describedby={"calendar of activities"}
          >
            <VisuallyHidden>
              <DrawerTitle>Calendar</DrawerTitle>
            </VisuallyHidden>
            <div className="relative flex items-center justify-center mb-2 mt-3">
              <div className="flex gap-2 flex-wrap">
                <YearButtons activityList={activityList} />
              </div>
              <button
                onClick={() => setShowCalendar(false)}
                className="absolute right-0 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <ProfileStats activityList={activityListByYearSelection} />
          </DrawerContent>
        </Drawer>
      </div>
    </>
  );
}
