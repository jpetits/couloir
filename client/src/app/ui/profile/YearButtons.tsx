"use client";

import { Activity } from "@/lib/schema";
import { Button } from "@/components/ui/button";
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
    new Set(activityList.map((a) => new Date(a.date).getFullYear())),
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
      {yearList.map((year) => (
        <Button
          key={year}
          variant={
            yearSelection === year
              ? "default"
              : activityList.filter(
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
    </>
  );
}
