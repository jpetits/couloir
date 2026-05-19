"use client";

import React, { useState } from "react";

import {
  ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { format } from "date-fns/format";
import {
  useRouter,
  useSearchParams,
} from "next/dist/client/components/navigation";
import Link from "next/link";
import { useShallow } from "zustand/react/shallow";

import { useDeleteActivity } from "@/app/hooks/useDeleteActivity";
import DeleteDialog from "@/app/ui/modal/DeleteDialog";
import { DATE_FORMAT } from "@/lib/constants";
import { Activity } from "@/lib/schema";
import { formatDuration } from "@/lib/utils";
import { ROUTES } from "@/routing/constants";
import { useActivitySelectionStore } from "@/store/activitySelection";

const FONT_CONDENSED = "'Barlow Condensed', sans-serif";
const FONT_MONO = "'JetBrains Mono', monospace";

const SORT_COLS = [
  { id: "name", label: "NAME" },
  { id: "startDate", label: "DATE" },
  { id: "distance", label: "DIST" },
  { id: "duration", label: "TIME" },
  { id: "elevationGain", label: "ELEV" },
  { id: "maxSpeed", label: "SPEED" },
] as const;

function getSportColor(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("snowboard") || n.includes("ski")) return "#74C0FC";
  if (n.includes("surf")) return "#38D9A9";
  if (
    n.includes("vélo") ||
    n.includes("velo") ||
    n.includes("bike") ||
    n.includes("cycl")
  )
    return "#FFD43B";
  if (n.includes("natation") || n.includes("swim")) return "#4DABF7";
  if (n.includes("course") || n.includes("run") || n.includes("trail"))
    return "#FF6B35";
  if (n.includes("marche") || n.includes("rando")) return "#A9E34B";
  return "#555555";
}

function SortBtn({
  col,
  sorting,
  onSort,
}: {
  col: (typeof SORT_COLS)[number];
  sorting: SortingState;
  onSort: (id: string) => void;
}) {
  const active = sorting.find((s) => s.id === col.id);
  return (
    <button
      onClick={() => onSort(col.id)}
      style={{ fontFamily: FONT_MONO, fontSize: "9px" }}
      className={`tracking-widest transition-colors ${
        active ? "text-[#aaa]" : "text-[#333] hover:text-[#666]"
      }`}
    >
      {col.label}
      {active ? (active.desc ? " ↓" : " ↑") : ""}
    </button>
  );
}

export function DataTable<TData extends { id: string }, TValue>({
  columns,
  data,
  isPendingUpload,
  isLoading,
  isFetchingNextPage,
}: {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isPendingUpload?: boolean;
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [selectedActivityToDelete, setSelectedActivityToDelete] =
    useState<Activity | null>(null);

  const [sorting, setSorting] = useState<SortingState>(() => {
    const sort = searchParams.get("sortBy");
    const order = searchParams.get("sortOrder");
    return sort ? [{ id: sort, desc: order === "desc" }] : [];
  });

  const handleSort = (colId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const current = sorting.find((s) => s.id === colId);
    const newSorting: SortingState = !current
      ? [{ id: colId, desc: true }]
      : current.desc
        ? [{ id: colId, desc: false }]
        : [];

    setSorting(newSorting);
    if (newSorting.length > 0) {
      params.set("sortBy", newSorting[0].id);
      params.set("sortOrder", newSorting[0].desc ? "desc" : "asc");
    } else {
      params.delete("sortBy");
      params.delete("sortOrder");
    }
    router.push(`?${params}`);
  };

  const [toggle, selected] = useActivitySelectionStore(
    useShallow((state) => [state.toggle, state.selected]),
  );

  const table = useReactTable({
    data,
    columns: React.useMemo(() => columns, [columns]),
    meta: {
      onDelete: (activity: Activity) => setSelectedActivityToDelete(activity),
      activityList: data,
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  });

  const { mutate: deleteActivity } = useDeleteActivity();
  const activities = table
    .getRowModel()
    .rows.map((r) => r.original) as unknown as Activity[];
  const skeletonCount = isLoading
    ? 8
    : isFetchingNextPage || isPendingUpload
      ? 2
      : 0;

  return (
    <div className="mt-4">
      {/* Sort header */}
      <div className="flex items-center justify-end gap-6 px-4 pb-2 border-b border-[#161616]">
        {SORT_COLS.map((col) => (
          <SortBtn
            key={col.id}
            col={col}
            sorting={sorting}
            onSort={handleSort}
          />
        ))}
        <div className="w-5" />
      </div>

      {/* Activity rows */}
      <div>
        {activities.map((activity) => {
          const color = getSportColor(activity.name);
          const isSelected = selected.includes(activity.id);
          const distKm = (activity.distance / 1000).toFixed(1);
          const avgSpeedKmh = (
            activity.distance /
            1000 /
            (activity.duration / 3600)
          ).toFixed(1);

          return (
            <div
              key={activity.id}
              onClick={() => toggle(activity.id)}
              className="group flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-[#131313] transition-colors duration-75 hover:bg-[#0f0f0f]"
              style={{
                borderLeft: `2px solid ${isSelected ? color : "transparent"}`,
              }}
            >
              {/* Sport color dot */}
              <div
                className="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-transform duration-150 group-hover:scale-125"
                style={{ backgroundColor: color }}
              />

              {/* Name + mobile data */}
              <div className="flex-1 min-w-0">
                <Link
                  href={ROUTES.activity(activity.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="block truncate"
                  style={{ fontFamily: FONT_CONDENSED }}
                >
                  <span className="text-[15px] font-semibold uppercase tracking-wide text-[#c8c3b8] hover:text-[#f0ebe0] transition-colors">
                    {activity.name}
                  </span>
                </Link>
                <div
                  className="md:hidden mt-0.5 text-[#444]"
                  style={{ fontFamily: FONT_MONO, fontSize: "10px" }}
                >
                  {format(activity.startDate, DATE_FORMAT)} · {distKm} km ·{" "}
                  {formatDuration(activity.duration, false)}
                </div>
              </div>

              {/* Desktop data strip */}
              <div
                className="hidden md:flex items-center gap-6 flex-shrink-0"
                style={{ fontFamily: FONT_MONO }}
              >
                <span className="text-[11px] text-[#444] w-20 text-right tabular-nums">
                  {format(activity.startDate, DATE_FORMAT)}
                </span>
                <span className="text-[11px] text-[#666] w-12 text-right tabular-nums">
                  {distKm}
                  <span className="text-[#333] text-[9px] ml-0.5">km</span>
                </span>
                <span className="text-[11px] text-[#666] w-14 text-right tabular-nums">
                  {formatDuration(activity.duration, false)}
                </span>
                <span className="text-[11px] text-[#555] w-14 text-right tabular-nums">
                  {activity.elevationGain > 0
                    ? `+${Math.round(activity.elevationGain)}`
                    : "—"}
                  {activity.elevationGain > 0 && (
                    <span className="text-[#333] text-[9px] ml-0.5">m</span>
                  )}
                </span>
                <span className="text-[11px] text-[#444] w-14 text-right tabular-nums">
                  {avgSpeedKmh}
                  <span className="text-[#333] text-[9px] ml-0.5">km/h</span>
                </span>
              </div>

              {/* Delete — appears on hover */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedActivityToDelete(activity);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-100 text-[#2a2a2a] hover:text-[#FF6B35] flex-shrink-0 ml-1"
                aria-label="Delete"
              >
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M1 3h12M4.5 3V2a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v1M5.5 6v5M8.5 6v5M2 3l.7 8.3A1 1 0 003.7 12h6.6a1 1 0 001-.7L12 3"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          );
        })}

        {/* Empty state */}
        {!isLoading && activities.length === 0 && (
          <div className="py-20 text-center">
            <div
              className="text-[#1e1e1e] mb-3"
              style={{
                fontFamily: FONT_CONDENSED,
                fontSize: "48px",
                fontWeight: 700,
              }}
            >
              NO RESULTS
            </div>
            <div
              className="text-[#333]"
              style={{
                fontFamily: FONT_MONO,
                fontSize: "10px",
                letterSpacing: "0.15em",
              }}
            >
              ADJUST YOUR FILTERS
            </div>
          </div>
        )}

        {/* Loading skeletons */}
        {skeletonCount > 0 &&
          Array.from({ length: skeletonCount }).map((_, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 px-4 py-3 border-b border-[#131313]"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#1e1e1e] animate-pulse" />
              <div className="flex-1">
                <div
                  className="h-3.5 bg-[#1a1a1a] rounded-sm animate-pulse"
                  style={{ width: `${140 + (idx % 3) * 40}px` }}
                />
              </div>
              <div className="hidden md:flex gap-6">
                {[80, 48, 56, 56, 56].map((w, j) => (
                  <div
                    key={j}
                    className="h-3 bg-[#181818] rounded-sm animate-pulse"
                    style={{ width: `${w}px`, animationDelay: `${j * 60}ms` }}
                  />
                ))}
              </div>
              <div className="w-5" />
            </div>
          ))}
      </div>

      {selectedActivityToDelete && (
        <DeleteDialog
          display={!!selectedActivityToDelete}
          onDelete={() => {
            deleteActivity([selectedActivityToDelete.id]);
            setSelectedActivityToDelete(null);
          }}
          onCancel={() => setSelectedActivityToDelete(null)}
        />
      )}
    </div>
  );
}
