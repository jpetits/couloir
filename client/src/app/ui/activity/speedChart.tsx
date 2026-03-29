"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import type { MouseHandlerDataParam, TooltipIndex } from "recharts";
import type { Point } from "@/lib/schema";
import { useCallback } from "react";

export default function SpeedChart({
  points,
  onHover,
  hoveredIndex,
}: {
  points: Point[];
  onHover: (index: number | null) => void;
  hoveredIndex?: number | null;
}) {
  const data = points.map((p, i) => {
    return {
      cumDist: parseFloat((p.cumDist / 1000).toFixed(2)),
      speed: Math.round(p.speed),
      index: i,
    };
  });

  const handleMouseMove = useCallback(
    (e: MouseHandlerDataParam) => {
      const activeIndex = e?.activeIndex as TooltipIndex | undefined;
      if (activeIndex != null && parseInt(activeIndex) >= 0) {
        onHover(parseInt(activeIndex));
      }
    },
    [onHover],
  );

  const handleMouseLeave = useCallback(() => onHover(null), [onHover]);

  return (
    <div className="w-full h-48 mt-5">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            <linearGradient id="speedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="cumDist"
            type="number"
            domain={["dataMin", "dataMax"]}
            unit=" km"
            tick={{ fontSize: 11 }}
            stroke="#6b7280"
          />
          <YAxis
            unit=" m/s"
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
            formatter={(v) => (v != null ? [`${v} km/h`, "Speed"] : [])}
          />
          {hoveredIndex != null && data[hoveredIndex] && (
            <ReferenceLine
              x={data[hoveredIndex].cumDist}
              stroke="#3b82f6"
              strokeDasharray="3 3"
              label={{
                value: `${data[hoveredIndex].speed} km/h`,
                fill: "#fff",
                fontSize: 11,
                position: "insideTopRight",
              }}
            />
          )}
          <Area
            type="monotone"
            dataKey="speed"
            stroke="#3b82f6"
            fill="url(#speedGradient)"
            strokeWidth={2}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
