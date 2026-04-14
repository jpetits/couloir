import { useEffect, useRef, useState } from "react";

import { BLOCK_TOTAL_SIZE, MONTHS } from "@/lib/constants";

const DEFAULT_WEEKS = 200;
export function useResizeCalendar() {
  const [weeks, setWeeks] = useState(DEFAULT_WEEKS);
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef) return;
    const observer = new ResizeObserver(([entry]) => {
      const blockSize = BLOCK_TOTAL_SIZE;
      setWeeks(Math.floor(entry.contentRect.width / blockSize));
    });
    observer.observe(containerRef);
    return () => observer.disconnect();
  }, [containerRef]);

  return { weeks, setContainerRef };
}

export function useLabelCalendar(
  selection: { start: string; end: string } | null,
  startDate: string,
) {
  const calendarWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!calendarWrapperRef.current) return;
    if (!selection) {
      calendarWrapperRef.current.querySelectorAll("text").forEach((el) => {
        el.style.fontWeight = "";
        el.style.fill = "";
      });
      return;
    }

    const selectedMonth = new Date(selection.start).getMonth();
    const selectedYear = new Date(selection.start).getFullYear();

    calendarWrapperRef.current.querySelectorAll("text").forEach((el) => {
      const monthIndex = MONTHS.findIndex((m) => el.textContent?.startsWith(m));
      if (monthIndex === -1) return;
      const x = parseFloat(el.getAttribute("x") ?? "0");
      const weekOffset = Math.floor(x / 16);
      const clickedDate = new Date(startDate);
      clickedDate.setDate(clickedDate.getDate() + weekOffset * 7);
      const match =
        clickedDate.getMonth() === selectedMonth &&
        clickedDate.getFullYear() === selectedYear;
      el.style.fontWeight = match ? "bold" : "";
      el.style.fill = match ? "var(--color-primary, #3b82f6)" : "";
    });
  }, [selection, startDate]);

  return { calendarWrapperRef };
}
