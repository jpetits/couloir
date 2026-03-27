import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useApi } from "./useApi";
import { postActivity } from "@/lib/data.client";

export function useUpload() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const apiFetch = useApi();

  const uploadFile = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      await postActivity(apiFetch, file);
      await queryClient.invalidateQueries({ queryKey: ["activities"] });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, uploadFile };
}
