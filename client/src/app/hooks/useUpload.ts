import { useState } from "react";
import { ActivitySchema } from "@/lib/schema";
import { useQueryClient } from "@tanstack/react-query";
import { useApi } from "./useApi";

export function useUpload() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const apiFetch = useApi();

  const uploadFile = async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const data = await apiFetch("/api/activities", {
        method: "POST",
        body: formData,
      });
      ActivitySchema.parse(data);
      await queryClient.invalidateQueries({ queryKey: ["activities"] });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, uploadFile };
}
