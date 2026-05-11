"use client";

import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFilters } from "@/app/hooks/useFilters";

export default function ActivityFilters() {
  const { filters, setFilters } = useFilters();

  const [minDist, setMinDist] = useState(filters.minDistance ?? "");
  const [maxDist, setMaxDist] = useState(filters.maxDistance ?? "");
  const [maxSpeed, setMaxSpeed] = useState(filters.maxSpeed ?? "");
  const [search, setSearch] = useState(filters.q ?? "");

  const [debouncedMin] = useDebounce(minDist, 400);
  const [debouncedMax] = useDebounce(maxDist, 400);
  const [debouncedMaxSpeed] = useDebounce(maxSpeed, 400);
  const [debouncedSearch] = useDebounce(search, 400);

  useEffect(() => {
    setFilters({ minDistance: debouncedMin || undefined });
  }, [debouncedMin]);

  useEffect(() => {
    setFilters({ maxDistance: debouncedMax || undefined });
  }, [debouncedMax]);

  useEffect(() => {
    setFilters({ maxSpeed: debouncedMaxSpeed || undefined });
  }, [debouncedMaxSpeed]);

  useEffect(() => {
    setFilters({ q: debouncedSearch || undefined });
  }, [debouncedSearch]);

  const activeCount = [
    minDist, maxDist, maxSpeed, search,
    filters.dateFrom, filters.dateTo,
  ].filter(Boolean).length;

  function reset() {
    setMinDist("");
    setMaxDist("");
    setMaxSpeed("");
    setSearch("");
    setFilters({
      minDistance: undefined,
      maxDistance: undefined,
      maxSpeed: undefined,
      q: undefined,
      dateFrom: undefined,
      dateTo: undefined,
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search activities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 pr-8 h-9"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </div>

        {/* Distance */}
        <div className="flex items-center gap-1">
          <Input
            type="number"
            placeholder="Min km"
            value={minDist}
            onChange={(e) => setMinDist(e.target.value)}
            className="h-7 w-20 text-xs px-2"
          />
          <span className="text-xs text-muted-foreground">–</span>
          <Input
            type="number"
            placeholder="Max km"
            value={maxDist}
            onChange={(e) => setMaxDist(e.target.value)}
            className="h-7 w-20 text-xs px-2"
          />
          <span className="text-xs text-muted-foreground ml-0.5">km</span>
        </div>

        <div className="w-px h-4 bg-border" />

        {/* Dates */}
        <div className="flex items-center gap-1">
          <Input
            type="date"
            value={filters.dateFrom || ""}
            onChange={(e) => setFilters({ dateFrom: e.target.value || undefined })}
            className="h-7 w-32 text-xs px-2"
          />
          <span className="text-xs text-muted-foreground">–</span>
          <Input
            type="date"
            value={filters.dateTo || ""}
            onChange={(e) => setFilters({ dateTo: e.target.value || undefined })}
            className="h-7 w-32 text-xs px-2"
          />
        </div>

        <div className="w-px h-4 bg-border" />

        {/* Speed */}
        <div className="flex items-center gap-1">
          <Input
            type="number"
            placeholder="Max km/h"
            value={maxSpeed}
            onChange={(e) => setMaxSpeed(e.target.value)}
            className="h-7 w-24 text-xs px-2"
          />
          <span className="text-xs text-muted-foreground">km/h</span>
        </div>

        {/* Active count + reset */}
        {activeCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
            className="h-7 px-2 text-xs gap-1.5 text-muted-foreground hover:text-foreground ml-auto"
          >
            <span className="bg-foreground text-background rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-medium">
              {activeCount}
            </span>
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
