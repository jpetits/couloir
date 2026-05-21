import { Suspense } from "react";

import StatsContent from "@/app/ui/stats/StatsContent";

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 border-b border-ui-line">
      {Array(4)
        .fill(null)
        .map((_, i) => (
          <div
            key={i}
            className="py-10 px-4 md:px-6 border-r border-ui-line last:border-r-0 nth-[-n+2]:border-b md:nth-[-n+2]:border-b-0"
          >
            <div className="h-12 bg-ui-surface rounded w-3/4 mb-2 animate-pulse" />
            <div className="h-4 bg-ui-surface rounded w-1/2 animate-pulse" />
          </div>
        ))}
    </div>
  );
}

export default async function StatsPage() {
  return (
    <div className="font-condensed -mx-4 md:-mx-6">
      <div className="flex items-end justify-between px-4 md:px-6 pb-4 border-b border-ui-line">
        <div className="flex items-baseline gap-4">
          <h1 className="text-4xl font-bold tracking-wider uppercase text-ui-hi">
            Statistiques
          </h1>
        </div>
      </div>
      <Suspense fallback={<StatsSkeleton />}>
        <StatsContent />
      </Suspense>
    </div>
  );
}
