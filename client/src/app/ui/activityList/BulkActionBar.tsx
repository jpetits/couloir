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
    <div
      className="fixed bottom-0 left-0 right-0 border-t border-[#222] bg-[#0a0a0a]/95 backdrop-blur-sm px-6 py-4 flex items-center justify-between z-50"
      style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
    >
      <span className="text-sm tracking-widest uppercase text-[#666]">
        <span className="text-[#f0ebe0] font-semibold">{selected.length}</span>{" "}
        selected
      </span>
      <div className="flex gap-3">
        <button
          onClick={deleteSelected}
          className="px-4 py-1.5 border border-[#FF6B35]/40 text-[#FF6B35] text-xs tracking-widest uppercase hover:bg-[#FF6B35]/10 transition-colors"
        >
          Delete
        </button>
        <button
          onClick={clear}
          className="px-4 py-1.5 border border-[#333] text-[#666] text-xs tracking-widest uppercase hover:border-[#555] hover:text-[#888] transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
