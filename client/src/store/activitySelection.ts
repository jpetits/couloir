import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SelectionStore {
  selected: string[];
  toggle: (id: string) => void;
  clear: () => void;
  retainOnly: (ids: string[]) => void;
}

export const useActivitySelectionStore = create<SelectionStore>()(
  persist(
    (set) => ({
      selected: [],
      toggle: (id) =>
        set((s) => ({
          selected: s.selected.includes(id)
            ? s.selected.filter((x) => x !== id)
            : [...s.selected, id],
        })),
      clear: () => set({ selected: [] }),
      retainOnly: (ids) =>
        set((s) => ({ selected: s.selected.filter((id) => ids.includes(id)) })),
    }),
    { name: "activity-selection" },
  ),
);
