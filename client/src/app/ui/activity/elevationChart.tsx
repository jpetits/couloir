"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { MouseHandlerDataParam } from "recharts";
import type { Point } from "@/lib/schema";
import { useCallback } from "react";

export default function ElevationChart({
  points,
  onHover,
}: {
  points: Point[];
  onHover: (index: number | null) => void;
}) {
  let cumDist = 0;
  const data = points.map((p, i) => {
    cumDist += p.dist;
    return {
      dist: parseFloat((cumDist / 1000).toFixed(2)),
      ele: Math.round(p.ele * 1000),
      index: i,
    };
  });

  const handleMouseMove = useCallback(
    (e: MouseHandlerDataParam) => {
      if (typeof e?.activeIndex === "number") {
        onHover(e.activeIndex);
      }
    },
    [onHover],
  );

  const handleMouseLeave = useCallback(() => onHover(null), [onHover]);

  return (
    <div className="w-full h-48 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            <linearGradient id="elevGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="dist"
            unit=" km"
            tick={{ fontSize: 11 }}
            stroke="#6b7280"
          />
          <YAxis
            unit=" m"
            tick={{ fontSize: 11 }}
            stroke="#6b7280"
            width={55}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1f2937",
              border: "none",
              borderRadius: 6,
            }}
            labelFormatter={(v) => `${v} km`}
            formatter={(v) => (v != null ? [`${v} m`, "Altitude"] : [])}
          />
          <Area
            type="monotone"
            dataKey="ele"
            stroke="#3b82f6"
            fill="url(#elevGradient)"
            strokeWidth={2}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
