"use client";

import { useEffect, useRef, useState } from "react";

import { formatDuration } from "@/lib/utils";

type MetricFormat = "count" | "km" | "elevation" | "duration";

interface Metric {
  rawValue: number;
  unit: string;
  label: string;
  format: MetricFormat;
}

function formatValue(value: number, format: MetricFormat): string {
  switch (format) {
    case "count":
      return Math.round(value).toString();
    case "km":
      return (value / 1000).toFixed(0);
    case "elevation":
      return Math.round(value).toLocaleString("fr");
    case "duration":
      return formatDuration(Math.round(value), false);
  }
}

function AnimatedNumber({
  target,
  format,
  unit,
}: {
  target: number;
  format: MetricFormat;
  unit: string;
}) {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number | null>(null);
  const DURATION = 1400;

  useEffect(() => {
    startRef.current = null;
    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / DURATION, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(eased * target);
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target]);

  return (
    <div className="text-4xl font-bold tabular-nums text-ui-hi leading-none">
      {formatValue(current, format)}
      {unit && (
        <span className="text-lg font-normal text-ui-dim ml-1">{unit}</span>
      )}
    </div>
  );
}

export function AnimatedStats({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 border-b border-ui-line">
      {metrics.map(({ rawValue, unit, label, format }, i) => (
        <div
          key={i}
          className="py-5 px-4 md:px-6 border-r border-ui-line last:border-r-0 nth-[-n+2]:border-b md:nth-[-n+2]:border-b-0"
        >
          <AnimatedNumber target={rawValue} format={format} unit={unit} />
          <div className="font-mono text-3xs tracking-widest text-ui-muted mt-2">
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}
