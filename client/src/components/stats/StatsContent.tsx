import { fetchStats } from "@/lib/data";

import { AnimatedStats } from "./AnimatedStats";

export default async function StatsContent() {
  const stats = await fetchStats();

  const metrics = [
    {
      rawValue: stats.count,
      unit: "",
      label: "ACTIVITÉS",
      format: "count" as const,
    },
    {
      rawValue: stats.totalDistance,
      unit: "km",
      label: "DISTANCE",
      format: "km" as const,
    },
    {
      rawValue: stats.totalElevationLoss,
      unit: "m",
      label: "DÉNIVELÉ",
      format: "elevation" as const,
    },
    {
      rawValue: stats.totalDuration,
      unit: "",
      label: "DURÉE",
      format: "duration" as const,
    },
  ];

  return <AnimatedStats metrics={metrics} />;
}
