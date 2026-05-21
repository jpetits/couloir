"use client";

import { Button } from "@/components/ui/button";
import { Activity } from "@/lib/schema";
import { useMapStore } from "@/store/mapStore";

export default function YearButtons({
  activityList,
}: {
  activityList: Activity[];
}) {
  const yearSelection = useMapStore((state) => state.yearSelection);
  const setYearSelection = useMapStore((state) => state.setYearSelection);
  const activityIdList = useMapStore((state) => state.activityIdList);

  const yearList = Array.from(
    new Set(activityList.map((a) => a.startDate.getFullYear())),
  ).sort((a, b) => a - b);

  return (
    <>
      <Button
        variant={yearSelection === null ? "default" : "outline"}
        className="cursor-pointer"
        size="sm"
        onClick={() => setYearSelection(null)}
      >
        All
      </Button>
      {yearList.map((year) => {
        const hasActivityInYear =
          activityList.filter(
            (a) =>
              activityIdList.has(a.id) && a.startDate.getFullYear() === year,
          ).length > 0;
        return (
          <Button
            key={year}
            variant={
              yearSelection === year
                ? "default"
                : hasActivityInYear
                  ? "outline"
                  : "ghost"
            }
            className={hasActivityInYear ? "cursor-pointer" : ""}
            size="sm"
            onClick={() => hasActivityInYear && setYearSelection(year)}
          >
            {year}
          </Button>
        );
      })}
    </>
  );
}
