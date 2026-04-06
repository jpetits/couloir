"use client";

import { useActivitySelectionStore } from "@/store/activitySelection";
import { useDeleteActivity } from "@/app/hooks/useDeleteActivity";
import { useShallow } from "zustand/react/shallow";

export default function BulkActionBar() {
  const [clear, selected] = useActivitySelectionStore(
    useShallow((state) => [state.clear, state.selected]),
  );
  const { mutate: deleteActivity } = useDeleteActivity();

  if (selected.length === 0) return null;

  const deleteSelected = () => {
    selected.forEach((id) => deleteActivity(id));
    clear();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex items-center justify-between z-50">
      <span>{selected.length} activité(s) sélectionnée(s)</span>
      <div className="flex gap-2">
        <button
          onClick={deleteSelected}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Supprimer la sélection
        </button>
        <button
          onClick={clear}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Effacer la sélection
        </button>
      </div>
    </div>
  );
}
