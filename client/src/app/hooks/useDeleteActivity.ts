"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import { useApi } from "./useApi";
import { deleteActivity } from "@/lib/data.client";
import type { Activity } from "@/lib/schema";

export function useDeleteActivity() {
  const queryClient = useQueryClient();
  const apiFetch = useApi();
  const queryKey = ["activities"];

  return useMutation({
    mutationFn: (id: string) => deleteActivity(apiFetch, id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey,
      });

      const previousData = queryClient.getQueriesData<InfiniteData<Activity[]>>(
        {
          queryKey,
        },
      );

      queryClient.setQueriesData<InfiniteData<Activity[]>>(
        { queryKey },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) =>
              page.filter((activity) => activity.id !== id),
            ),
          };
        },
      );

      return { previousData };
    },

    onError: (_err, _id, onMutateResult) => {
      queryClient.setQueryData(queryKey, onMutateResult?.previousData);
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey,
      });
    },
  });
}
