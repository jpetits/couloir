"use client";

import React, { useEffect, useRef, useState } from "react";
import { Activity } from "@/lib/schema";
import {
  ActivityCalendar,
  type Activity as CalendarActivity,
} from "react-activity-calendar";
import { useMapStore } from "@/store/mapStore";
import { format, startOfWeek, subDays, subWeeks } from "date-fns";
import { useTheme } from "next-themes";

export default function ProfileStats({
  activitiyList,
  username,
}: {
  activitiyList: Activity[];
  username: string;
}) {
  const { resolvedTheme } = useTheme();
  const selection = useMapStore((state) => state.dateSelection);
  const hoveredDate = useMapStore((state) => state.hoveredDate);
  const setDateSelection = useMapStore((state) => state.setDateSelection);
  const activityIdList = useMapStore((state) => state.activityIdList);

  const activityListFiltered = activitiyList.filter((a) =>
    activityIdList.has(a.id),
  );

  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  const [weeks, setWeeks] = useState(52);
  useEffect(() => {
    if (!containerRef) return;
    const observer = new ResizeObserver(([entry]) => {
      const blockSize = 16; // blockSize + blockMargin
      setWeeks(Math.floor(entry.contentRect.width / blockSize));
    });
    observer.observe(containerRef);
    return () => observer.disconnect();
  }, [containerRef]);

  const start = format(
    startOfWeek(subWeeks(new Date(), weeks), { weekStartsOn: 0 }),
    "yyyy-MM-dd",
  );

  const end = format(subDays(new Date(), 1), "yyyy-MM-dd");

  const data = Object.entries(
    activityListFiltered.reduce(
      (acc, activity) => ({
        ...acc,
        [activity.date.split("T")[0]]:
          (acc[activity.date.split("T")[0]] || 0) + 1,
      }),
      {} as Record<string, number>,
    ),
  ).map(([date, count]) => ({
    date,
    count,
    level: Math.min(count, 4) as 0 | 1 | 2 | 3 | 4,
  }));

  return (
    <>
      <h1 className="text-3xl font-bold mb-6">
        Activités publiques de {username}
      </h1>
      <div ref={setContainerRef} />
      <ActivityCalendar
        className="*:[scrollbar-width:none] [&>*::-webkit-scrollbar]:hidden"
        colorScheme={resolvedTheme === "dark" ? "dark" : "light"}
        theme={{
          light: ["#e5e7eb", "#93c5fd", "#60a5fa", "#3b82f6", "#1d4ed8"],
          dark: ["#374151", "#1e3a5f", "#1d4ed8", "#2563eb", "#3b82f6"],
        }}
        showTotalCount={false}
        blockSize={12}
        blockMargin={4}
        renderBlock={(block, activity) => {
          const isSelected =
            selection &&
            activity.date >= selection.start &&
            activity.date <= selection.end;
          const isHovered = hoveredDate === activity.date;
          return React.cloneElement(block, {
            style: {
              cursor: "pointer",
              fill: isSelected || isHovered ? "red" : undefined,
              transition: "fill 0.18s",
            },
            ref: isHovered
              ? (el: SVGRectElement | null) =>
                  el?.scrollIntoView({
                    behavior: "smooth",
                    inline: "center",
                    block: "nearest",
                  })
              : undefined,
            onClick: (e) => {
              if (e.shiftKey && selection) {
                const [a, b] = [selection.start, activity.date].sort();
                setDateSelection({ start: a, end: b });
              } else if (
                selection &&
                (selection.start === activity.date ||
                  selection.end === activity.date)
              ) {
                setDateSelection(null);
              } else {
                setDateSelection({
                  start: activity.date,
                  end: activity.date,
                });
              }
            },
          } as React.SVGProps<SVGRectElement>);
        }}
        data={(() => {
          const map = new Map(data.map((d) => [d.date, d]));
          if (!map.has(start))
            map.set(start, { date: start, count: 0, level: 0 });
          if (!map.has(end)) map.set(end, { date: end, count: 0, level: 0 });
          return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
        })()} // Affiche un bloc vide si aucune activité n'est présente
      />
    </>
  );
}
