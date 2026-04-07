"use client";

import { ROUTES } from "@/routing/constants";
import { useRouter } from "next/dist/client/components/navigation";

export default function StravaConnectButton() {
  const router = useRouter();
  return (
    <button
      onClick={() =>
        router.push(ROUTES.external.stravaAuth(window.location.href))
      }
      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors cursor-pointer"
    >
      Connecter Strava
    </button>
  );
}
