import { useEffect, useState } from "react";
import { BLOCK_TOTAL_SIZE } from "@/lib/constants";

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
