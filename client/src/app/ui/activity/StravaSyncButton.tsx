"use client";

import { stravaSync } from "@/lib/dataClient";
import { useApi } from "../../hooks/useApi";

export default function StravaSyncButton() {
  const apiFetch = useApi();
  return (
    <button
      onClick={() => stravaSync(apiFetch)}
      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors cursor-pointer"
    >
      Synchroniser avec Strava
    </button>
  );
}
