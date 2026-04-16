"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityCalendar,
  Activity as BlockActivity,
  BlockElement,
} from "react-activity-calendar";

import { addDays, format, startOfWeek, subWeeks } from "date-fns";
import { useTheme } from "next-themes";

import {
  useLabelCalendar,
  useResizeCalendar,
} from "@/app/hooks/useActivityCalendar";
import {
  BLOCK_MARGIN,
  BLOCK_SIZE,
  BLOCK_TOTAL_SIZE,
  DATE_FORMAT,
  MONTHS,
} from "@/lib/constants";
import { Activity } from "@/lib/schema";
import { useMapStore } from "@/store/mapStore";

const THEME_COLORS = {
  light: ["#e5e7eb", "#93c5fd", "#60a5fa", "#3b82f6", "#1d4ed8"],
  dark: ["#374151", "#1e3a5f", "#1d4ed8", "#2563eb", "#3b82f6"],
};

export default function ProfileStats({
  activityList,
}: {
  activityList: Activity[];
}) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { weeks, setContainerRef } = useResizeCalendar();
  const selection = useMapStore((state) => state.dateSelection);
  const hoveredDate = useMapStore((state) => state.hoveredDate);
  const setDateSelection = useMapStore((state) => state.setDateSelection);
  const activityIdList = useMapStore((state) => state.activityIdList);

  const setSelectedActivityId = useMapStore(
    (state) => state.setSelectedActivityId,
  );

  const activityListFiltered = activityList.filter((a) =>
    activityIdList.has(a.id),
  );

  const startDate = useMemo(() => {
    const minStartDate = format(
      startOfWeek(subWeeks(new Date(), weeks), {
        weekStartsOn: 0,
      }),
      DATE_FORMAT,
    );

    const firstActivity = activityListFiltered[activityListFiltered.length - 1];
    if (!firstActivity?.startDate) return minStartDate;
    const activityListFirstDate = format(firstActivity.startDate, DATE_FORMAT);

    if (activityListFirstDate > minStartDate) return minStartDate;

    return activityListFirstDate;
  }, [activityListFiltered, weeks]);

  const lastDate = useMemo(() => {
    const minLastDate = format(
      addDays(new Date(startDate), weeks * 7 - 1),
      DATE_FORMAT,
    );

    const lastActivity = activityListFiltered[0];
    if (!lastActivity?.startDate) return minLastDate;
    const activityListLastDate = format(lastActivity.startDate, DATE_FORMAT);

    if (activityListLastDate < minLastDate) return minLastDate;

    return activityListLastDate;
  }, [activityListFiltered, weeks, startDate]);

  const activityCalendarData = useMemo(() => {
    const countByDate = activityListFiltered.reduce<Record<string, number>>(
      (acc, activity) => ({
        ...acc,
        [format(activity.startDate, DATE_FORMAT)]:
          (acc[format(activity.startDate, DATE_FORMAT)] || 0) + 1,
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
    return {
      months: Array.from({ length: 12 }, (_, i) => {
        return MONTHS[i];
      }),
      totalCount: "{{count}} activities found",
    };
  }, [startDate]);

  const handleBlockClick = (
    e: React.MouseEvent<SVGRectElement>,
    date: string,
    hasActivity: boolean,
  ) => {
    e.stopPropagation();

    if (!hasActivity) return;
    setSelectedActivityId(null);
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
    setSelectedActivityId(null);
    const hasActivityInYear =
      activityList.filter(
        (a) =>
          activityIdList.has(a.id) &&
          a.startDate.getMonth() === clickedDate.getMonth() &&
          a.startDate.getFullYear() === year,
      ).length > 0;
    if (!hasActivityInYear) return;
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

  const { calendarWrapperRef } = useLabelCalendar(selection, startDate);

  return (
    <>
      <div ref={setContainerRef} />
      <div
        className="[&_text]:cursor-pointer"
        onClick={(e) => handleMonthClick(e)}
        ref={calendarWrapperRef}
      >
        <ActivityCalendar
          labels={labels}
          className="*:[scrollbar-width:none] [&>*::-webkit-scrollbar]:hidden"
          colorScheme={mounted && resolvedTheme === "dark" ? "dark" : "light"}
          theme={THEME_COLORS}
          showTotalCount
          blockSize={BLOCK_SIZE}
          blockMargin={BLOCK_MARGIN}
          renderBlock={(block, activity) => blockRender(block, activity)}
          data={activityCalendarData}
        />
      </div>
    </>
  );
}
