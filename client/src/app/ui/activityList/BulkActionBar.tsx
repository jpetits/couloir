"use client";

import { useShallow } from "zustand/react/shallow";

import { useDeleteActivity } from "@/app/hooks/useDeleteActivity";
import { useActivitySelectionStore } from "@/store/activitySelection";

export default function BulkActionBar() {
  const [clear, selected] = useActivitySelectionStore(
    useShallow((state) => [state.clear, state.selected]),
  );
  const { mutate: deleteActivity } = useDeleteActivity();

  if (selected.length === 0) return null;

  const deleteSelected = () => {
    deleteActivity(selected);
    clear();
  };

  return (
    <div className="font-condensed fixed bottom-0 left-0 right-0 border-t border-ui-line bg-ui-surface/95 backdrop-blur-sm px-6 py-4 flex items-center justify-between z-50">
      <span className="text-sm tracking-widest uppercase text-ui-muted">
        <span className="text-ui-hi font-semibold">{selected.length}</span>{" "}
        selected
      </span>
      <div className="flex gap-3">
        <button
          onClick={deleteSelected}
          className="px-4 py-1.5 border border-ui-accent/40 text-ui-accent text-xs tracking-widest uppercase hover:bg-ui-accent/10 transition-colors"
        >
          Delete
        </button>
        <button
          onClick={clear}
          className="px-4 py-1.5 border border-ui-line text-ui-muted text-xs tracking-widest uppercase hover:border-ui-dim hover:text-ui-base transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
