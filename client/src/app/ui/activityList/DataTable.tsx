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
import { Trash } from "lucide-react";
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

const SORT_COLS = [
  { id: "name", label: "NAME" },
  { id: "startDate", label: "DATE" },
  { id: "distance", label: "DIST" },
  { id: "duration", label: "TIME" },
  { id: "elevationGain", label: "ELEV" },
  { id: "maxSpeed", label: "SPEED" },
] as const;

type SportClasses = { dot: string; border: string };

function getSportClasses(name: string): SportClasses {
  const n = name.toLowerCase();
  if (n.includes("snowboard") || n.includes("ski"))
    return { dot: "bg-blue-300", border: "border-l-blue-300" };
  if (n.includes("surf"))
    return { dot: "bg-teal-400", border: "border-l-teal-400" };
  if (
    n.includes("vélo") ||
    n.includes("velo") ||
    n.includes("bike") ||
    n.includes("cycl")
  )
    return { dot: "bg-yellow-400", border: "border-l-yellow-400" };
  if (n.includes("natation") || n.includes("swim"))
    return { dot: "bg-blue-400", border: "border-l-blue-400" };
  if (n.includes("course") || n.includes("run") || n.includes("trail"))
    return { dot: "bg-orange-400", border: "border-l-orange-400" };
  if (n.includes("marche") || n.includes("rando"))
    return { dot: "bg-lime-400", border: "border-l-lime-400" };
  return { dot: "bg-stone-400", border: "border-l-stone-400" };
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
      className={`font-mono text-3xs tracking-widest transition-colors ${
        active ? "text-ui-base" : "text-ui-dim hover:text-ui-muted"
      }`}
    >
      {col.label}
      {active ? (active.desc ? " ↓" : " ↑") : ""}
    </button>
  );
}

const SKELETON_WIDTHS = ["w-36", "w-44", "w-52"] as const;
const SKELETON_COL_WIDTHS = ["w-20", "w-12", "w-14", "w-14", "w-14"] as const;
const SKELETON_DELAYS = [
  "delay-0",
  "delay-75",
  "delay-100",
  "delay-150",
  "delay-200",
] as const;

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
      <div className="flex items-center gap-3 px-4 pb-2 border-b border-ui-line">
        <div className="w-1.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <SortBtn col={SORT_COLS[0]} sorting={sorting} onSort={handleSort} />
        </div>
        <div className="hidden md:flex items-center gap-6 shrink-0">
          <div className="w-20 flex justify-end">
            <SortBtn col={SORT_COLS[1]} sorting={sorting} onSort={handleSort} />
          </div>
          <div className="w-12 flex justify-end">
            <SortBtn col={SORT_COLS[2]} sorting={sorting} onSort={handleSort} />
          </div>
          <div className="w-14 flex justify-end">
            <SortBtn col={SORT_COLS[3]} sorting={sorting} onSort={handleSort} />
          </div>
          <div className="w-14 flex justify-end">
            <SortBtn col={SORT_COLS[4]} sorting={sorting} onSort={handleSort} />
          </div>
          <div className="w-14 flex justify-end">
            <SortBtn col={SORT_COLS[5]} sorting={sorting} onSort={handleSort} />
          </div>
        </div>
        <div className="w-5 shrink-0" />
      </div>

      {/* Activity rows */}
      <div>
        {activities.map((activity) => {
          const sport = getSportClasses(activity.name);
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
              className={`group flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-ui-line-dim border-l-2 transition-colors duration-75 hover:bg-ui-surface ${
                isSelected ? sport.border : "border-l-transparent"
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full shrink-0 transition-transform duration-150 group-hover:scale-125 ${sport.dot}`}
              />

              <div className="flex-1 min-w-0">
                <Link
                  href={ROUTES.activity(activity.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="block truncate font-condensed"
                >
                  <span className="text-sm font-semibold uppercase tracking-wide text-ui-base hover:text-ui-hi transition-colors">
                    {activity.name}
                  </span>
                </Link>
                <div className="font-mono text-2xs md:hidden mt-0.5 text-ui-muted">
                  {format(activity.startDate, DATE_FORMAT)} · {distKm} km ·{" "}
                  {formatDuration(activity.duration, false)}
                </div>
                {activity.images && activity.images.length > 0 && (
                  <div className="flex gap-1 mt-1.5">
                    {activity.images.slice(0, 3).map((img) => (
                      <img
                        key={img.id}
                        src={ROUTES.api.imagePath(img.immichId, "thumbnail")}
                        alt=""
                        className="w-8 h-8 object-cover rounded-sm opacity-80 group-hover:opacity-100 transition-opacity"
                      />
                    ))}
                    {activity.images.length > 3 && (
                      <div className="w-8 h-8 rounded-sm bg-ui-fill flex items-center justify-center">
                        <span className="font-mono text-3xs text-ui-dim">
                          +{activity.images.length - 3}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="font-mono hidden md:flex items-center gap-6 shrink-0">
                <span className="text-xs text-ui-muted w-20 text-right tabular-nums">
                  {format(activity.startDate, DATE_FORMAT)}
                </span>
                <span className="text-xs text-ui-muted w-12 text-right tabular-nums">
                  {distKm}
                  <span className="text-ui-dim text-xs ml-0.5">km</span>
                </span>
                <span className="text-xs text-ui-muted w-14 text-right tabular-nums">
                  {formatDuration(activity.duration, false)}
                </span>
                <span className="text-xs text-ui-muted w-14 text-right tabular-nums">
                  {activity.elevationGain > 0
                    ? `+${Math.round(activity.elevationGain)}`
                    : "—"}
                  {activity.elevationGain > 0 && (
                    <span className="text-ui-dim text-xs ml-0.5">m</span>
                  )}
                </span>
                <span className="text-xs text-ui-muted w-14 text-right tabular-nums">
                  {avgSpeedKmh}
                  <span className="text-ui-dim text-xs ml-0.5">km/h</span>
                </span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedActivityToDelete(activity);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-100 text-ui-dim hover:text-ui-accent shrink-0 ml-1"
                aria-label="Delete"
              >
                <Trash size={14} />
              </button>
            </div>
          );
        })}

        {!isLoading && activities.length === 0 && (
          <div className="py-20 text-center">
            <div className="font-condensed text-5xl font-bold text-ui-ghost mb-3">
              NO RESULTS
            </div>
            <div className="font-mono text-2xs tracking-loose text-ui-dim">
              ADJUST YOUR FILTERS
            </div>
          </div>
        )}

        {skeletonCount > 0 &&
          Array.from({ length: skeletonCount }).map((_, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 px-4 py-3 border-b border-ui-line-dim"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-ui-fill animate-pulse" />
              <div className="flex-1">
                <div
                  className={`h-3.5 bg-ui-fill rounded-sm animate-pulse ${SKELETON_WIDTHS[idx % 3]}`}
                />
              </div>
              <div className="hidden md:flex gap-6">
                {SKELETON_COL_WIDTHS.map((w, j) => (
                  <div
                    key={j}
                    className={`h-3 bg-ui-fill rounded-sm animate-pulse ${w} ${SKELETON_DELAYS[j]}`}
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
