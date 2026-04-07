"use client";

import { useStravaSync } from "@/app/hooks/useStravaSync";

export default function StravaSyncButton() {
  const { status, progress, startSync } = useStravaSync();

  return (
    <button
      onClick={() => startSync()}
      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors cursor-pointer"
      disabled={status === "syncing"}
      style={{
        background:
          status === "syncing"
            ? `linear-gradient(to right, #15803d             
  ${progress}%, #22c55e ${progress}%)`
            : "#22c55e",
      }}
    >
      {status === "idle" && "Synchroniser avec Strava"}
      {status === "syncing" && `Synchronisation...(${progress}%)`}
      {status === "done" && "Synchronisation terminée ✓"}
      {status === "error" && "Erreur — réessayer"}
    </button>
  );
}
