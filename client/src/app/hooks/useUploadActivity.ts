import {
  InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useApi } from "./useApi";
import { postActivity } from "@/lib/data.client";
import { Activity } from "@/lib/schema";

export function useUploadActivity() {
  const queryClient = useQueryClient();
  const apiFetch = useApi();

  const { mutate, isPending, error } = useMutation({
    mutationFn: (file: File) => postActivity(apiFetch, file),
    mutationKey: ["uploadActivity"],
    onSuccess: (newActivity) => {
      queryClient.setQueriesData<InfiniteData<Activity[]>>(
        { queryKey: ["activities"] },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: [[newActivity, ...old.pages[0]], ...old.pages.slice(1)],
          };
        },
      );
    },
  });

  return { isPending, error, uploadActivity: mutate };
}
