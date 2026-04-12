import { create } from "zustand";

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
}

export const useMapStore = create<MapStore>((set) => ({
  dateSelection: null,
  hoveredDate: null,
  yearSelection: null,
  activityIdList: new Set(),
  setActivityIdList: (activityIdList) =>
    set({ activityIdList: new Set(activityIdList) }),
  setHoveredDate: (hoveredDate) => set({ hoveredDate }),
  setDateSelection: (dateSelection) =>
    set({
      dateSelection,
    }),
  setYearSelection: (yearSelection) => set({ yearSelection }),
}));
