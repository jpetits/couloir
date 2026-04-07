"use client";

import { useFilters } from "@/app/hooks/useFilters";
import { useDebounce } from "use-debounce";
import { useEffect, useState } from "react";

export default function ActivityFilters() {
  const { filters, setFilters } = useFilters();

  const [minDist, setMinDist] = useState(filters.minDistance ?? "");
  const [maxDist, setMaxDist] = useState(filters.maxDistance ?? "");
  const [debouncedMin] = useDebounce(minDist, 400);
  const [debouncedMax] = useDebounce(maxDist, 400);

  useEffect(() => {
    setFilters({ minDistance: debouncedMin || undefined });
  }, [debouncedMin]);

  useEffect(() => {
    setFilters({ maxDistance: debouncedMax || undefined });
  }, [debouncedMax]);

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center mt-2">
      <label className="text-sm font-medium" htmlFor="minDistance">
        Distance (km):
      </label>
      <input
        id="minDistance"
        type="number"
        placeholder="Minimum distance"
        value={minDist}
        onChange={(e) => setMinDist(e.target.value)}
        className="border p-2 rounded w-full sm:flex-1"
      />
      <label className="text-sm font-medium" htmlFor="maxDistance">
        to
      </label>
      <input
        id="maxDistance"
        type="number"
        placeholder="Maximum distance"
        value={maxDist}
        onChange={(e) => setMaxDist(e.target.value)}
        className="border p-2 rounded w-full sm:flex-1"
      />
      <label className="text-sm font-medium" htmlFor="startDate">
        Start date:
      </label>
      <input
        id="startDate"
        type="date"
        placeholder="Start date"
        value={filters.dateFrom || ""}
        onChange={(e) => setFilters({ dateFrom: e.target.value })}
        className="border p-2 rounded w-full sm:flex-1"
      />
      <label className="text-sm font-medium" htmlFor="endDate">
        End date:
      </label>
      <input
        id="endDate"
        type="date"
        placeholder="End date"
        value={filters.dateTo || ""}
        onChange={(e) => setFilters({ dateTo: e.target.value })}
        className="border p-2 rounded w-full sm:flex-1"
      />
    </div>
  );
}
