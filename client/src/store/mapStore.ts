import { create } from "zustand";

import { PointStats } from "@/types/activity";

type DateSelection = { start: string; end: string } | null;

export interface MapStore {
  dateSelection: DateSelection;
  setDateSelection: (s: DateSelection) => void;
  hoveredDate: string | null;
  setHoveredDate: (hoveredDate: string | null) => void;
  activityIdList: Set<string>;
  setActivityIdList: (activityIdList: string[]) => void;
  yearSelection: number | null;
  setYearSelection: (yearSelection: number | null) => void;
  hoveredActivityPoints: PointStats[];
  setHoveredActivityPoints: (points: PointStats[]) => void;
  hoveredPoint: PointStats | null;
  setHoveredPoint: (point: PointStats | null) => void;
  selectedActivityId: string | null;
  setSelectedActivityId: (id: string | null) => void;
  heatMapField: { field: keyof PointStats; unit: string };
  setHeatMapField: (field: keyof PointStats, unit: string) => void;
}

export const useMapStore = create<MapStore>((set) => ({
  dateSelection: null,
  hoveredDate: null,
  yearSelection: null,
  activityIdList: new Set(),
  hoveredActivityPoints: [],
  hoveredPoint: null,
  selectedActivityId: null,
  setHoveredPoint: (point) => set({ hoveredPoint: point }),
  setActivityIdList: (activityIdList) =>
    set({ activityIdList: new Set(activityIdList) }),
  setHoveredDate: (hoveredDate) => set({ hoveredDate }),
  setDateSelection: (dateSelection) => set({ dateSelection }),
  setYearSelection: (yearSelection) => set({ yearSelection }),
  setHoveredActivityPoints: (points) => set({ hoveredActivityPoints: points }),
  setSelectedActivityId: (id) => set({ selectedActivityId: id }),
  heatMapField: { field: "speed", unit: "km/h" },
  setHeatMapField: (field, unit) => set({ heatMapField: { field, unit } }),
}));
