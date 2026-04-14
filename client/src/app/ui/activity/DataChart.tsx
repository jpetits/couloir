"use client";

import { useCallback } from "react";

import type { MouseHandlerDataParam, TooltipIndex } from "recharts";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import { PointStats } from "@/types/activity";

export default function DataChart({
  pointList,
  onHover,
  hoveredPoint,
  dataKey,
  unit,
}: {
  pointList: PointStats[];
  onHover: (point: PointStats | null) => void;
  hoveredPoint?: PointStats | null;
  dataKey: keyof PointStats;
  unit?: string;
}) {
  const handleMouseMove = useCallback(
    (e: MouseHandlerDataParam) => {
      const activeIndex = e?.activeIndex as TooltipIndex | undefined;
      if (activeIndex != null && parseInt(activeIndex) >= 0) {
        onHover(pointList[parseInt(activeIndex)]);
      }
    },
    [onHover, pointList],
  );

  const handleMouseLeave = useCallback(() => onHover(null), [onHover]);

  return (
    <div className="w-full h-48">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={pointList}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            <linearGradient
              id={`${dataKey}Gradient`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="5%" stopColor="#3b82f0" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="cumDistance"
            type="number"
            domain={["dataMin", "dataMax"]}
            unit=" km"
            tick={{ fontSize: 11 }}
            stroke="#6b7280"
          />
          <YAxis
            unit={` ${unit}`}
            tick={{ fontSize: 11 }}
            stroke="#6b7280"
            width={55}
          />
          {/* <Tooltip
            contentStyle={{
              backgroundColor: "#1f2937",
              border: "none",
              borderRadius: 6,
            }}
            labelFormatter={(v) => `${v} km`}
            formatter={(v) => (v != null ? [`${v} ${unit}`, "Speed"] : [])}
          /> */}
          {hoveredPoint != null && (
            <ReferenceLine
              x={hoveredPoint.cumDistance}
              stroke="#3b82f6"
              strokeDasharray="3 3"
              label={{
                value: `${hoveredPoint[dataKey]} ${unit}`,
                fill: "#fff",
                fontSize: 11,
                position: "insideTopRight",
              }}
            />
          )}
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke="#3b82f6"
            fill={`url(#${dataKey}Gradient)`}
            strokeWidth={2}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
