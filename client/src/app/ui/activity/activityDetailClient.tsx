"use client";

import { useState, useCallback } from "react";
import type { Point } from "@/lib/schema";
import ActivityMapWrapper from "./activityMapWrapper";
import ElevationChart from "./elevationChart";

export default function ActivityDetailClient({ points }: { points: Point[] }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const handleHover = useCallback(
    (index: number | null) => setHoveredIndex(index),
    [],
  );

  return (
    <>
      <ActivityMapWrapper points={points} hoveredIndex={hoveredIndex} />
      <ElevationChart points={points} onHover={handleHover} />
    </>
  );
}
