import { useEffect, useState } from "react";

import { useAuth } from "@clerk/nextjs";

import { ROUTES } from "@/routing/constants";

import { useApi } from "./useApi";

export function useStravaSync() {
  const [status, setStatus] = useState<"idle" | "syncing" | "done" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const { getToken } = useAuth();
  const apiFetch = useApi();

  useEffect(() => {
    let ws: WebSocket;

    getToken().then((token: string | null) => {
      if (!token) return;

      ws = new WebSocket(
        `${process.env.NEXT_PUBLIC_API_URL?.replace(/^http/, "ws")}/ws?token=${token}`,
      );

      ws.addEventListener("message", (event) => {
        const message = JSON.parse(event.data);
        if (message.type === "sync:progress") {
          setProgress(message.progress);
        } else if (message.type === "sync:done") {
          setProgress(100);
          setStatus("done");
        } else if (message.type === "sync:error") {
          console.error("Sync error:", message.message);
          setError(message.message);
          setStatus("error");
        }
      });
    });

    return () => {
      if (ws) ws.close();
    };
  }, []);

  const startSync = async () => {
    setStatus("syncing");
    setProgress(0);
    setError(null);
    await apiFetch(ROUTES.api.stravaSync, { method: "POST" });
  };

  return { status, progress, error, startSync };
}
