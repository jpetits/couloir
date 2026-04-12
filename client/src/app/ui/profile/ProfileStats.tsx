"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Activity } from "@/lib/schema";
import { ActivityCalendar } from "react-activity-calendar";
import { useMapStore } from "@/store/mapStore";
import { addDays, format, startOfWeek, subWeeks } from "date-fns";
import { useTheme } from "next-themes";

const MONTHS = [
  "Jan",
  "Fév",
  "Mar",
  "Avr",
  "Mai",
  "Juin",
  "Juil",
  "Aoû",
  "Sep",
  "Oct",
  "Nov",
  "Déc",
];
const BLOCK_SIZE = 12;
const BLOCK_MARGIN = 4;
const BLOCK_TOTAL_SIZE = BLOCK_SIZE + BLOCK_MARGIN;

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
  const [weeks, setWeeks] = useState(200);
  useEffect(() => {
    if (!containerRef) return;
    const observer = new ResizeObserver(([entry]) => {
      const blockSize = BLOCK_TOTAL_SIZE;
      setWeeks(Math.floor(entry.contentRect.width / blockSize));
    });
    observer.observe(containerRef);
    return () => observer.disconnect();
  }, [containerRef]);

  const start = useMemo(() => {
    const activityStart =
      activityListFiltered[activityListFiltered.length - 1]?.date.split("T")[0];
    const minStart = format(
      startOfWeek(subWeeks(new Date(), weeks), {
        weekStartsOn: 0,
      }),
      "yyyy-MM-dd",
    );
    return activityStart && activityStart < minStart ? activityStart : minStart;
  }, [activityListFiltered, weeks]);

  const end = useMemo(() => {
    const activityEnd = activityListFiltered[0]?.date.split("T")[0];
    const minEnd = format(
      addDays(new Date(start), weeks * 7 - 1),
      "yyyy-MM-dd",
    );
    return activityEnd && activityEnd > minEnd ? activityEnd : minEnd;
  }, [activityListFiltered, weeks, start]);

  const data = useMemo(
    () =>
      Object.entries(
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
      })),
    [activityListFiltered],
  );

  const labels = useMemo(() => {
    const [yearStr, monthStr] = start.split("-");
    const startYear = parseInt(yearStr);
    const startMonth = parseInt(monthStr) - 1;
    return {
      months: Array.from({ length: 12 }, (_, i) => {
        const year = i >= startMonth ? startYear : startYear + 1;
        const showYear = year !== startYear || i === startMonth;
        return showYear
          ? `${MONTHS[i]} 
  '${String(year).slice(2)}`
          : MONTHS[i];
      }),
    };
  }, [start]);

  return (
    <>
      <div ref={setContainerRef} />
      <div
        className="[&_text]:cursor-pointer"
        onClick={(e) => {
          const el = (e.target as Element).closest("text");
          if (!el) return;
          const text = el.textContent ?? "";
          const monthIndex = MONTHS.findIndex((m) => text.startsWith(m));
          if (monthIndex === -1) return;
          const x = parseFloat(el.getAttribute("x") ?? "0");
          const weekOffset = Math.floor(x / BLOCK_TOTAL_SIZE);
          const clickedDate = new Date(start);
          clickedDate.setDate(clickedDate.getDate() + weekOffset * 7);
          const year = clickedDate.getFullYear();
          if (
            selection &&
            selection.start.startsWith(
              `${year}-${String(monthIndex + 1).padStart(2, "0")}`,
            ) &&
            selection.end !== selection.start
          ) {
            setDateSelection(null);
            return;
          }
          setDateSelection({
            start: format(new Date(year, monthIndex, 1), "yyyy-MM-dd"),
            end: format(new Date(year, monthIndex + 1, 0), "yyyy-MM-dd"),
          });
        }}
      >
        <ActivityCalendar
          labels={labels}
          className="*:[scrollbar-width:none] [&>*::-webkit-scrollbar]:hidden"
          colorScheme={resolvedTheme === "dark" ? "dark" : "light"}
          theme={{
            light: ["#e5e7eb", "#93c5fd", "#60a5fa", "#3b82f6", "#1d4ed8"],
            dark: ["#374151", "#1e3a5f", "#1d4ed8", "#2563eb", "#3b82f6"],
          }}
          showTotalCount={false}
          blockSize={BLOCK_SIZE}
          blockMargin={BLOCK_MARGIN}
          renderBlock={(block, activity) => {
            const isSelected =
              selection &&
              activity.date >= selection.start &&
              activity.date <= selection.end;
            const isHovered = hoveredDate === activity.date;
            const hasActivity = activity.count > 0;
            return React.cloneElement(block, {
              style: {
                cursor: hasActivity ? "pointer" : undefined,
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
                e.stopPropagation();
                if (!hasActivity) return;
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
            return [...map.values()].sort((a, b) =>
              a.date.localeCompare(b.date),
            );
          })()} // Affiche un bloc vide si aucune activité n'est présente
        />
      </div>
    </>
  );
}
