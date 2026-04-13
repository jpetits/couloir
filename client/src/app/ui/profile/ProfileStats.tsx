"use client";

import React, { useMemo } from "react";
import { Activity } from "@/lib/schema";
import {
  ActivityCalendar,
  BlockElement,
  Activity as BlockActivity,
} from "react-activity-calendar";
import { useMapStore } from "@/store/mapStore";
import { addDays, format, startOfWeek, subWeeks } from "date-fns";
import { useTheme } from "next-themes";
import {
  MONTHS,
  BLOCK_MARGIN,
  BLOCK_SIZE,
  BLOCK_TOTAL_SIZE,
  DATE_FORMAT,
} from "@/lib/constants";
import { useResizeCalendar } from "@/app/hooks/useActivityCalendar";

const THEME_COLORS = {
  light: ["#e5e7eb", "#93c5fd", "#60a5fa", "#3b82f6", "#1d4ed8"],
  dark: ["#374151", "#1e3a5f", "#1d4ed8", "#2563eb", "#3b82f6"],
};

export default function ProfileStats({
  activitiyList,
}: {
  activitiyList: Activity[];
}) {
  const { resolvedTheme } = useTheme();
  const { weeks, setContainerRef } = useResizeCalendar();
  const selection = useMapStore((state) => state.dateSelection);
  const hoveredDate = useMapStore((state) => state.hoveredDate);
  const setDateSelection = useMapStore((state) => state.setDateSelection);
  const activityIdList = useMapStore((state) => state.activityIdList);

  const activityListFiltered = activitiyList.filter((a) =>
    activityIdList.has(a.id),
  );

  const startDate = useMemo(() => {
    const activityListFirstDate =
      activityListFiltered[activityListFiltered.length - 1]?.date.split("T")[0];

    const minStartDate = format(
      startOfWeek(subWeeks(new Date(), weeks), {
        weekStartsOn: 0,
      }),
      DATE_FORMAT,
    );

    if (!activityListFirstDate) return minStartDate;

    if (activityListFirstDate > minStartDate) return minStartDate;

    return activityListFirstDate;
  }, [activityListFiltered, weeks]);

  const lastDate = useMemo(() => {
    const activityListLastDate = activityListFiltered[0]?.date.split("T")[0];
    const minLastDate = format(
      addDays(new Date(startDate), weeks * 7 - 1),
      DATE_FORMAT,
    );

    if (!activityListLastDate) return minLastDate;

    if (activityListLastDate < minLastDate) return minLastDate;

    return activityListLastDate;
  }, [activityListFiltered, weeks, startDate]);

  const activityCalendarData = useMemo(() => {
    const countByDate = activityListFiltered.reduce<Record<string, number>>(
      (acc, activity) => ({
        ...acc,
        [activity.date.split("T")[0]]:
          (acc[activity.date.split("T")[0]] || 0) + 1,
      }),
      {},
    );

    const entries = new Map(
      Object.entries(countByDate).map(([date, count]) => [
        date,
        { date, count, level: Math.min(count, 4) as 0 | 1 | 2 | 3 | 4 },
      ]),
    );

    if (!entries.has(startDate))
      entries.set(startDate, { date: startDate, count: 0, level: 0 });
    if (!entries.has(lastDate))
      entries.set(lastDate, { date: lastDate, count: 0, level: 0 });

    return [...entries.values()].sort((a, b) => a.date.localeCompare(b.date));
  }, [activityListFiltered]);

  const labels = useMemo(() => {
    const [yearStr, monthStr] = startDate.split("-");
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
  }, [startDate]);

  const handleBlockClick = (
    e: React.MouseEvent<SVGRectElement>,
    date: string,
    hasActivity: boolean,
  ) => {
    e.stopPropagation();

    if (!hasActivity) return;
    if (e.shiftKey && selection) {
      const [a, b] = [selection.start, date].sort();
      setDateSelection({ start: a, end: b });
    } else if (
      selection &&
      (selection.start === date || selection.end === date)
    ) {
      setDateSelection(null);
    } else {
      setDateSelection({
        start: date,
        end: date,
      });
    }
  };

  const handleMonthClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = (e.target as Element).closest("text");
    if (!el) return;
    const text = el.textContent ?? "";
    const monthIndex = MONTHS.findIndex((m) => text.startsWith(m));
    if (monthIndex === -1) return;
    const x = parseFloat(el.getAttribute("x") ?? "0");
    const weekOffset = Math.floor(x / BLOCK_TOTAL_SIZE);
    const clickedDate = new Date(startDate);
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
  };

  const blockRender = (block: BlockElement, activity: BlockActivity) => {
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
      onClick: (e) => handleBlockClick(e, activity.date, hasActivity),
    } as React.SVGProps<SVGRectElement>);
  };

  return (
    <>
      <div ref={setContainerRef} />
      <div
        className="[&_text]:cursor-pointer"
        onClick={(e) => handleMonthClick(e)}
      >
        <ActivityCalendar
          labels={labels}
          className="*:[scrollbar-width:none] [&>*::-webkit-scrollbar]:hidden"
          colorScheme={resolvedTheme === "dark" ? "dark" : "light"}
          theme={THEME_COLORS}
          showTotalCount={false}
          blockSize={BLOCK_SIZE}
          blockMargin={BLOCK_MARGIN}
          renderBlock={(block, activity) => blockRender(block, activity)}
          data={activityCalendarData}
        />
      </div>
    </>
  );
}
