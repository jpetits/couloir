"use client";

import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import { useFilters } from "@/app/hooks/useFilters";

const FONT_CONDENSED = "'Barlow Condensed', sans-serif";
const FONT_MONO = "'JetBrains Mono', monospace";

function FilterChip({
  label,
  active,
  open,
  onClick,
}: {
  label: string;
  active: boolean;
  open: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{ fontFamily: FONT_MONO, fontSize: "10px" }}
      className={`px-3 py-1 tracking-widest uppercase transition-all duration-150 border ${
        active || open
          ? "border-[#555] text-[#f0ebe0] bg-[#1a1a1a]"
          : "border-[#222] text-[#555] hover:border-[#333] hover:text-[#888]"
      }`}
    >
      {label}
    </button>
  );
}

function FilterPanel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="px-4 py-3 border border-[#1e1e1e] bg-[#0d0d0d] animate-in fade-in-0 slide-in-from-top-1 duration-150"
      style={{ fontFamily: FONT_MONO }}
    >
      {children}
    </div>
  );
}

const inputCls =
  "bg-transparent border-b border-[#2a2a2a] text-[#ccc] text-[11px] focus:outline-none focus:border-[#555] pb-0.5 transition-colors";

export default function ActivityFilters() {
  const { filters, setFilters } = useFilters();

  const [search, setSearch] = useState(filters.q ?? "");
  const [minDist, setMinDist] = useState(filters.minDistance ?? "");
  const [maxDist, setMaxDist] = useState(filters.maxDistance ?? "");
  const [maxSpeed, setMaxSpeed] = useState(filters.maxSpeed ?? "");
  const [openPanel, setOpenPanel] = useState<"date" | "dist" | "speed" | null>(null);

  const [debouncedSearch] = useDebounce(search, 400);
  const [debouncedMin] = useDebounce(minDist, 400);
  const [debouncedMax] = useDebounce(maxDist, 400);
  const [debouncedSpeed] = useDebounce(maxSpeed, 400);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setFilters({ q: debouncedSearch || undefined }); }, [debouncedSearch]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setFilters({ minDistance: debouncedMin || undefined }); }, [debouncedMin]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setFilters({ maxDistance: debouncedMax || undefined }); }, [debouncedMax]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setFilters({ maxSpeed: debouncedSpeed || undefined }); }, [debouncedSpeed]);

  const activeCount = [minDist, maxDist, maxSpeed, search, filters.dateFrom, filters.dateTo].filter(Boolean).length;

  function reset() {
    setSearch(""); setMinDist(""); setMaxDist(""); setMaxSpeed("");
    setFilters({ q: undefined, minDistance: undefined, maxDistance: undefined, maxSpeed: undefined, dateFrom: undefined, dateTo: undefined });
  }

  const toggle = (panel: "date" | "dist" | "speed") =>
    setOpenPanel((prev) => (prev === panel ? null : panel));

  const dateLabel =
    filters.dateFrom || filters.dateTo
      ? `${filters.dateFrom ?? "…"} — ${filters.dateTo ?? "…"}`
      : "Date";
  const distLabel = minDist || maxDist ? `${minDist || "0"}–${maxDist || "∞"} km` : "Dist";
  const speedLabel = maxSpeed ? `≤ ${maxSpeed} km/h` : "Speed";

  return (
    <div className="space-y-2 pt-4">
      {/* Search bar */}
      <div className="relative">
        <span
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#333] select-none pointer-events-none"
          style={{ fontFamily: FONT_MONO, fontSize: "11px" }}
        >
          /
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="search activities…"
          className="w-full h-11 bg-transparent border border-[#1e1e1e] hover:border-[#2a2a2a] focus:border-[#3a3a3a] pl-8 pr-9 text-[#f0ebe0] placeholder-[#2e2e2e] focus:outline-none transition-colors duration-200"
          style={{ fontFamily: FONT_CONDENSED, fontSize: "15px", letterSpacing: "0.04em" }}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444] hover:text-[#888] transition-colors leading-none text-lg"
          >
            ×
          </button>
        )}
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <FilterChip
          label={dateLabel}
          active={!!(filters.dateFrom || filters.dateTo)}
          open={openPanel === "date"}
          onClick={() => toggle("date")}
        />
        <FilterChip
          label={distLabel}
          active={!!(minDist || maxDist)}
          open={openPanel === "dist"}
          onClick={() => toggle("dist")}
        />
        <FilterChip
          label={speedLabel}
          active={!!maxSpeed}
          open={openPanel === "speed"}
          onClick={() => toggle("speed")}
        />
        {activeCount > 0 && (
          <button
            onClick={reset}
            className="ml-auto text-[#444] hover:text-[#888] transition-colors"
            style={{ fontFamily: FONT_MONO, fontSize: "10px", letterSpacing: "0.1em" }}
          >
            CLEAR ({activeCount})
          </button>
        )}
      </div>

      {/* Inline panels */}
      {openPanel === "date" && (
        <FilterPanel>
          <div className="flex items-center gap-3">
            <span className="text-[#444] uppercase tracking-widest" style={{ fontSize: "9px" }}>From</span>
            <input
              type="date"
              value={filters.dateFrom || ""}
              onChange={(e) => setFilters({ dateFrom: e.target.value || undefined })}
              className={inputCls}
            />
            <span className="text-[#333]">—</span>
            <span className="text-[#444] uppercase tracking-widest" style={{ fontSize: "9px" }}>To</span>
            <input
              type="date"
              value={filters.dateTo || ""}
              onChange={(e) => setFilters({ dateTo: e.target.value || undefined })}
              className={inputCls}
            />
          </div>
        </FilterPanel>
      )}

      {openPanel === "dist" && (
        <FilterPanel>
          <div className="flex items-center gap-3">
            <span className="text-[#444] uppercase tracking-widest" style={{ fontSize: "9px" }}>Min</span>
            <input type="number" value={minDist} onChange={(e) => setMinDist(e.target.value)} placeholder="0" className={`${inputCls} w-14`} />
            <span className="text-[#333]">—</span>
            <span className="text-[#444] uppercase tracking-widest" style={{ fontSize: "9px" }}>Max</span>
            <input type="number" value={maxDist} onChange={(e) => setMaxDist(e.target.value)} placeholder="∞" className={`${inputCls} w-14`} />
            <span className="text-[#444]" style={{ fontSize: "9px" }}>KM</span>
          </div>
        </FilterPanel>
      )}

      {openPanel === "speed" && (
        <FilterPanel>
          <div className="flex items-center gap-3">
            <span className="text-[#444] uppercase tracking-widest" style={{ fontSize: "9px" }}>Max speed</span>
            <input type="number" value={maxSpeed} onChange={(e) => setMaxSpeed(e.target.value)} placeholder="∞" className={`${inputCls} w-20`} />
            <span className="text-[#444]" style={{ fontSize: "9px" }}>KM/H</span>
          </div>
        </FilterPanel>
      )}
    </div>
  );
}
